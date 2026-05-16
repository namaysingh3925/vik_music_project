const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
    const user = await User.findById(req.userId).select("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ favorites: user.favorites });
});

router.post("/", auth, async (req, res) => {
    const { name, image, spotifyId } = req.body || {};
    if (!name) return res.status(400).json({ message: "name is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.favorites.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
        return res.status(200).json({ favorites: user.favorites, message: "Already favorited" });
    }
    user.favorites.push({ name, image, spotifyId });
    await user.save();
    res.status(201).json({ favorites: user.favorites });
});

router.delete("/:name", auth, async (req, res) => {
    const { name } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.favorites = user.favorites.filter(
        (f) => f.name.toLowerCase() !== name.toLowerCase()
    );
    await user.save();
    res.json({ favorites: user.favorites });
});

module.exports = router;
