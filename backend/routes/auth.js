const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const signToken = (userId) =>
    jwt.sign({ userId }, process.env.JWT_SECRET || "secretKey123", { expiresIn: "7d" });

const publicUser = (u) => ({
    id: u._id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone || "",
});

router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body || {};
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Full name, email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ message: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            fullName,
            email: email.toLowerCase(),
            phone,
            password: hashed,
        });

        const token = signToken(user._id);
        res.status(201).json({ message: "Account created", token, user: publicUser(user) });
    } catch (_err) {
        console.error(_err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(400).json({ message: "Invalid email or password" });

        const token = signToken(user._id);
        res.json({ message: "Login successful", token, user: publicUser(user) });
    } catch (_err) {
        console.error(_err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ user: publicUser(user) });
    } catch (_err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
