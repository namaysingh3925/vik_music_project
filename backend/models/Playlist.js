const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
    trackId: { type: String, required: true },
    name: { type: String, required: true },
    artist: { type: String },
    album: { type: String },
    image: { type: String },
    previewUrl: { type: String },
    durationMs: { type: Number },
}, { _id: false });

const playlistSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    tracks: { type: [trackSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Playlist", playlistSchema);
