const express = require("express");
const router = express.Router();

// Proxy the Spotify token exchange through the backend
// so the browser doesn't hit CORS / network issues.

router.post("/token", async (req, res) => {
    try {
        const { code, code_verifier, redirect_uri, client_id } = req.body || {};
        if (!code || !code_verifier || !redirect_uri || !client_id) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const params = new URLSearchParams();
        params.append("client_id", client_id);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirect_uri);
        params.append("code_verifier", code_verifier);

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (err) {
        console.error("Spotify token exchange error:", err.message);
        res.status(500).json({ message: "Failed to exchange token with Spotify" });
    }
});

// Proxy Spotify API calls through the backend
router.get("/proxy", async (req, res) => {
    try {
        const { url, token } = req.query;
        if (!url || !token) {
            return res.status(400).json({ message: "url and token query params required" });
        }

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.json(data);
    } catch (err) {
        console.error("Spotify proxy error:", err.message);
        res.status(500).json({ message: "Failed to proxy Spotify request" });
    }
});

module.exports = router;
