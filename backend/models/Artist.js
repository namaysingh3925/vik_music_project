const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    q: { type: String, required: true, trim: true },
    image: { type: String, required: true },
}, { timestamps: true });

artistSchema.index({ name: "text", q: "text" });

module.exports = mongoose.model("Artist", artistSchema);
