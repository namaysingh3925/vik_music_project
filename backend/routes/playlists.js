const express = require("express");
const Playlist = require("../models/Playlist");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const playlists = await Playlist.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ playlists });
});

router.get("/:id", auth, async (req, res) => {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.userId });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json({ playlist });
});

router.post("/", auth, async (req, res) => {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: "name is required" });
    const playlist = await Playlist.create({
        user: req.userId,
        name,
        description: description || "",
    });
    res.status(201).json({ playlist });
});

router.delete("/:id", auth, async (req, res) => {
    const playlist = await Playlist.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json({ message: "Deleted" });
});

router.post("/:id/tracks", auth, async (req, res) => {
    const { trackId, name, artist, album, image, previewUrl, durationMs } = req.body || {};
    if (!trackId || !name) {
        return res.status(400).json({ message: "trackId and name are required" });
    }
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.userId });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (playlist.tracks.some((t) => t.trackId === trackId)) {
        return res.status(200).json({ playlist, message: "Track already in playlist" });
    }
    playlist.tracks.push({ trackId, name, artist, album, image, previewUrl, durationMs });
    await playlist.save();
    res.status(201).json({ playlist });
});

router.delete("/:id/tracks/:trackId", auth, async (req, res) => {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.userId });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    playlist.tracks = playlist.tracks.filter((t) => t.trackId !== req.params.trackId);
    await playlist.save();
    res.json({ playlist });
});

module.exports = router;
