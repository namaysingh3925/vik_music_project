const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const favoritesRoutes = require("./routes/favorites");
const likedSongsRoutes = require("./routes/likedSongs");
const playlistRoutes = require("./routes/playlists");
const spotifyRoutes = require("./routes/spotify");
const musicRoutes = require("./routes/music");
const seedArtists = require("./utils/seedArtists");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/musicDB")
    .then(async () => {
        console.log("MongoDB Connected");
        try {
            await seedArtists();
            console.log("Artist images seeded");
        } catch (err) {
            console.error("Artist seed error:", err.message);
        }
    })
    .catch((err) => console.error("MongoDB connection error:", err.message));

app.get("/", (_req, res) => res.send("HMusic backend is running"));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/liked-songs", likedSongsRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/spotify", spotifyRoutes);
app.use("/api/music", musicRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
