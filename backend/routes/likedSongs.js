const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.userId).select("likedSongs");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ likedSongs: user.likedSongs });
});

router.post("/", auth, async (req, res) => {
    const { trackId, name, artist, album, image, previewUrl, durationMs } = req.body || {};
    if (!trackId || !name) {
        return res.status(400).json({ message: "trackId and name are required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.likedSongs.some((s) => s.trackId === trackId)) {
        return res.status(200).json({ likedSongs: user.likedSongs, message: "Already liked" });
    }
    user.likedSongs.push({ trackId, name, artist, album, image, previewUrl, durationMs });
    await user.save();
    res.status(201).json({ likedSongs: user.likedSongs });
});

router.delete("/:trackId", auth, async (req, res) => {
    const { trackId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.likedSongs = user.likedSongs.filter((s) => s.trackId !== trackId);
    await user.save();
    res.json({ likedSongs: user.likedSongs });
});

module.exports = router;
