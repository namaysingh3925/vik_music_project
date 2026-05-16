const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String },
    spotifyId: { type: String },
}, { _id: false });

const trackSchema = new mongoose.Schema({
    trackId: { type: String, required: true },
    name: { type: String, required: true },
    artist: { type: String },
    album: { type: String },
    image: { type: String },
    previewUrl: { type: String },
    durationMs: { type: Number },
}, { _id: false });

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String },
    password: { type: String, required: true },
    favorites: { type: [artistSchema], default: [] },
    likedSongs: { type: [trackSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
