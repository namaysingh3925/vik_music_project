// Music API helpers — uses Deezer via backend proxy (no auth required!)
// Falls back gracefully; Spotify connect is optional and adds personalisation only.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// ---------- Search ----------

export async function searchMusic(q) {
    const r = await fetch(`${API_BASE}/music/search?q=${encodeURIComponent(q)}`);
    if (!r.ok) throw new Error("Search failed");
    return r.json();  // { artists: [...], tracks: [...] }
}

// ---------- Artist lookup by name ----------

export async function getArtistByQuery(q) {
    const r = await fetch(`${API_BASE}/music/artist-search?q=${encodeURIComponent(q)}`);
    if (!r.ok) return null;
    return r.json();  // { id, name, image }
}

// ---------- Artist detail ----------

export async function getArtistInfo(artistId) {
    const r = await fetch(`${API_BASE}/music/artist/${artistId}`);
    if (!r.ok) throw new Error("Failed to load artist");
    return r.json();  // { id, name, image, followers }
}

// ---------- Artist top tracks ----------

export async function getArtistTopTracks(artistId) {
    const r = await fetch(`${API_BASE}/music/artist/${artistId}/top?limit=10`);
    if (!r.ok) throw new Error("Failed to load top tracks");
    return r.json();  // { tracks: [...] }
}

// ---------- Helpers ----------

// Tracks coming from the backend are already in the right format:
// { trackId, name, artist, album, image, previewUrl, durationMs }
export function trackFromApi(t) {
    return t;  // already normalised by the backend
}

// ---------- Legacy Spotify compat (kept for components that may reference these) ----------

export function hasSpotifyToken() {
    return !!localStorage.getItem("spotifyToken");
}

export function trackFromSpotify(t) {
    return trackFromApi(t);
}

// Spotify OAuth — kept for optional "Connect Spotify" button.
const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri = import.meta.env.VITE_REDIRECT_URI;

const scopes = [
    "user-read-currently-playing",
    "user-read-recently-played",
    "user-read-playback-state",
    "user-top-read",
    "user-modify-playback-state",
    "streaming",
];

export async function redirectToAuthCodeFlow() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append("scope", scopes.join(" "));
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function getAccessToken(code) {
    const verifier = localStorage.getItem("verifier");
    const result = await fetch(`${API_BASE}/spotify/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            code,
            code_verifier: verifier,
            redirect_uri: redirectUri,
            client_id: clientId,
        }),
    });
    const data = await result.json();
    if (!result.ok) {
        throw new Error(data.error_description || data.message || "Token exchange failed");
    }
    return data.access_token;
}

// PKCE helpers
function generateCodeVerifier(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}
