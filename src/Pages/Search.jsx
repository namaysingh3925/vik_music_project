import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchMusic } from "../spotify";
import { trendingArtists } from "../data/artists";
import TrackRow from "../components/TrackRow";
import { usePlayer } from "../context/PlayerContext";

export default function Search() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const q = params.get("q") || "";
    const { playTracks } = usePlayer();

    const [artists, setArtists] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        if (!q) {
            setArtists([]); setTracks([]); return;
        }

        // Local trending artist match (instant)
        const localMatches = trendingArtists.filter((a) =>
            a.name.toLowerCase().includes(q.toLowerCase())
        );

        setLoading(true);
        setErr("");
        searchMusic(q)
            .then((data) => {
                const apiArtists = data.artists || [];
                // De-duplicate against local matches by name
                const seen = new Set(apiArtists.map((a) => a.name.toLowerCase()));
                const combined = [
                    ...apiArtists,
                    ...localMatches.filter((a) => !seen.has(a.name.toLowerCase())),
                ];
                setArtists(combined);
                setTracks(data.tracks || []);
            })
            .catch((e) => {
                setErr(e.message);
                // Show at least local matches on error
                setArtists(localMatches);
            })
            .finally(() => setLoading(false));
    }, [q]);

    if (!q) {
        return (
            <div>
                <h1 className="page-title">Search</h1>
                <p>Type a song or artist in the sidebar search to begin.</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="page-title">Results for &ldquo;{q}&rdquo;</h1>
            {loading && <div>Searching…</div>}
            {err && <div className="info-banner">{err}</div>}

            {artists.length > 0 && (
                <section style={{ marginBottom: 32 }}>
                    <h2 className="section-title">Artists</h2>
                    <div className="grid-container">
                        {artists.slice(0, 8).map((a) => (
                            <div
                                key={a.name}
                                className="artist-card"
                                onClick={() => navigate(`/artist/${encodeURIComponent(a.name)}`)}
                            >
                                <div className="circle-avatar">
                                    {a.image
                                        ? <img src={a.image} alt={a.name} />
                                        : <div className="avatar-fallback">{a.name[0]}</div>}
                                </div>
                                <div className="artist-info">
                                    <p className="artist-name">{a.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {tracks.length > 0 && (
                <section>
                    <h2 className="section-title">Songs</h2>
                    <div className="track-list">
                        <div className="track-row track-head">
                            <div className="track-index">#</div>
                            <div className="track-image" />
                            <div className="track-meta">Title</div>
                            <div className="track-album">Album</div>
                            <div className="track-duration">Time</div>
                            <div />
                        </div>
                        {tracks.map((t, i) => (
                            <TrackRow
                                key={t.trackId}
                                track={t}
                                index={i}
                                onPlay={(idx) => {
                                    const playable = tracks.filter((x) => x.previewUrl);
                                    const start = playable.findIndex((x) => x.trackId === tracks[idx].trackId);
                                    playTracks(playable, Math.max(0, start));
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}

            {!loading && artists.length === 0 && tracks.length === 0 && !err && (
                <div className="empty-state">No matches.</div>
            )}
        </div>
    );
}
