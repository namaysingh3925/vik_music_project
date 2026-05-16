const express = require("express");
const Artist = require("../models/Artist");
const router = express.Router();

// iTunes Search API — free, no auth, works globally.
const ITUNES = "https://itunes.apple.com";

// ---------- Curated artists stored in MongoDB ----------
router.get("/artists/trending", async (_req, res) => {
    try {
        const artists = await Artist.find().sort({ name: 1 }).lean();
        res.json({ artists });
    } catch (err) {
        console.error("Trending artists error:", err.message);
        res.status(500).json({ message: "Failed to fetch artists" });
    }
});

router.get("/artists/local-search", async (req, res) => {
    try {
        const q = (req.query.q || "").trim();
        if (!q) return res.json({ artists: [] });

        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const artists = await Artist.find({
            $or: [
                { name: { $regex: escaped, $options: "i" } },
                { q: { $regex: escaped, $options: "i" } },
            ],
        }).limit(12).lean();

        res.json({ artists });
    } catch (err) {
        console.error("Local artist search error:", err.message);
        res.status(500).json({ message: "Failed to search saved artists" });
    }
});

// ---------- Search artists + tracks ----------
router.get("/search", async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.status(400).json({ message: "q is required" });

        const [artistRes, trackRes, savedArtists] = await Promise.all([
            fetch(`${ITUNES}/search?term=${encodeURIComponent(q)}&entity=musicArtist&limit=12`),
            fetch(`${ITUNES}/search?term=${encodeURIComponent(q)}&entity=song&limit=15`),
            findSavedArtists(q),
        ]);

        const artistData = await artistRes.json();
        const trackData = await trackRes.json();

        // De-duplicate artists by name
        const seen = new Set();
        const savedByName = new Map(savedArtists.map((a) => [a.name.toLowerCase(), a]));
        const artists = (artistData.results || [])
            .filter((a) => {
                const key = a.artistName.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map((a) => ({
                id: a.artistId,
                name: a.artistName,
                image: savedByName.get(a.artistName.toLowerCase())?.image || null,
            }));

        for (const saved of savedArtists) {
            const key = saved.name.toLowerCase();
            if (!seen.has(key)) {
                artists.push({
                    id: saved._id,
                    name: saved.name,
                    image: saved.image,
                });
                seen.add(key);
            }
        }

        const tracks = (trackData.results || []).map(formatTrack);

        res.json({ artists, tracks });
    } catch (err) {
        console.error("Music search error:", err.message);
        res.status(500).json({ message: "Search failed" });
    }
});

// ---------- Search artist by name (returns first match) ----------
router.get("/artist-search", async (req, res) => {
    try {
        const q = req.query.q;
        if (!q) return res.status(400).json({ message: "q is required" });

        const r = await fetch(`${ITUNES}/search?term=${encodeURIComponent(q)}&entity=musicArtist&limit=1`);
        const data = await r.json();
        const a = data.results?.[0];
        const saved = await findSavedArtist(q);

        if (!a && !saved) return res.status(404).json({ message: "Artist not found" });

        res.json({
            id: a?.artistId || saved._id,
            name: a?.artistName || saved.name,
            image: saved?.image || null,
        });
    } catch (err) {
        console.error("Artist search error:", err.message);
        res.status(500).json({ message: "Search failed" });
    }
});

// ---------- Get artist info ----------
router.get("/artist/:id", async (req, res) => {
    try {
        const r = await fetch(`${ITUNES}/lookup?id=${req.params.id}`);
        const data = await r.json();
        const a = data.results?.[0];

        if (!a) return res.status(404).json({ message: "Artist not found" });
        const saved = await findSavedArtist(a.artistName);

        res.json({
            id: a.artistId,
            name: a.artistName,
            image: saved?.image || null,
            genres: a.primaryGenreName ? [a.primaryGenreName] : [],
        });
    } catch (err) {
        console.error("Artist fetch error:", err.message);
        res.status(500).json({ message: "Failed to fetch artist" });
    }
});

// ---------- Get artist top tracks ----------
router.get("/artist/:id/top", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const r = await fetch(
            `${ITUNES}/lookup?id=${req.params.id}&entity=song&limit=${limit + 1}`
        );
        const data = await r.json();

        // First result is the artist entity, rest are songs
        const songs = (data.results || []).filter((r) => r.wrapperType === "track");
        res.json({
            tracks: songs.map(formatTrack),
        });
    } catch (err) {
        console.error("Top tracks error:", err.message);
        res.status(500).json({ message: "Failed to fetch top tracks" });
    }
});

// ---------- Audio proxy — stream preview through backend ----------
// Falls back to sample audio if the original source is blocked.
const FALLBACK_AUDIO = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
];

router.get("/audio", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ message: "url is required" });

    try {
        // Try the original audio URL first
        const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
            const ct = response.headers.get("content-type");
            const cl = response.headers.get("content-length");
            if (ct) res.setHeader("Content-Type", ct);
            if (cl) res.setHeader("Content-Length", cl);
            res.setHeader("Accept-Ranges", "bytes");
            res.setHeader("Cache-Control", "public, max-age=86400");

            const reader = response.body.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) { res.end(); break; }
                res.write(value);
            }
            return;
        }
    } catch (_e) {
        // Original URL blocked or timed out — fall back
    }

    // Fallback: pick a consistent sample based on the URL hash
    try {
        let hash = 0;
        for (let i = 0; i < url.length; i++) hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
        const idx = Math.abs(hash) % FALLBACK_AUDIO.length;
        const fallback = await fetch(FALLBACK_AUDIO[idx]);

        if (!fallback.ok) {
            return res.status(502).json({ message: "Audio unavailable" });
        }

        const ct = fallback.headers.get("content-type");
        const cl = fallback.headers.get("content-length");
        if (ct) res.setHeader("Content-Type", ct);
        if (cl) res.setHeader("Content-Length", cl);
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Cache-Control", "public, max-age=86400");

        const reader = fallback.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) { res.end(); break; }
            res.write(value);
        }
    } catch (err) {
        console.error("Audio fallback error:", err.message);
        if (!res.headersSent) {
            res.status(500).json({ message: "Audio proxy failed" });
        }
    }
});

function formatTrack(t) {
    // Build a higher-res artwork URL (iTunes default is 100x100, we want 300x300)
    const art = t.artworkUrl100
        ? t.artworkUrl100.replace("100x100", "300x300")
        : null;

    // Route the preview audio through our backend proxy
    let proxyPreview = null;
    if (t.previewUrl) {
        proxyPreview = `/api/music/audio?url=${encodeURIComponent(t.previewUrl)}`;
    }

    return {
        trackId: String(t.trackId),
        name: t.trackName || t.trackCensoredName,
        artist: t.artistName,
        album: t.collectionName,
        image: art,
        previewUrl: proxyPreview,
        durationMs: t.trackTimeMillis || 0,
    };
}

async function findSavedArtist(q) {
    const escaped = String(q || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!escaped) return null;
    return Artist.findOne({
        $or: [
            { name: { $regex: `^${escaped}$`, $options: "i" } },
            { q: { $regex: `^${escaped}$`, $options: "i" } },
        ],
    }).lean();
}

async function findSavedArtists(q) {
    const escaped = String(q || "").trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!escaped) return [];
    return Artist.find({
        $or: [
            { name: { $regex: escaped, $options: "i" } },
            { q: { $regex: escaped, $options: "i" } },
        ],
    }).limit(12).lean();
}

module.exports = router;
