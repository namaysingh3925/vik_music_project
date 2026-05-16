// Backend API client. Reads token from localStorage on each request.
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

async function request(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const t = localStorage.getItem("authToken");
        if (t) headers.Authorization = `Bearer ${t}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch { /* no body */ }
    if (!res.ok) {
        const msg = (data && data.message) || `Request failed (${res.status})`;
        throw new Error(msg);
    }
    return data;
}

export const api = {
    signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
    login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
    me: () => request("/auth/me"),

    getTrendingArtists: () => request("/music/artists/trending", { auth: false }),
    searchSavedArtists: (q) => request(`/music/artists/local-search?q=${encodeURIComponent(q)}`, { auth: false }),

    getFavorites: () => request("/favorites"),
    addFavorite: (artist) => request("/favorites", { method: "POST", body: artist }),
    removeFavorite: (name) => request(`/favorites/${encodeURIComponent(name)}`, { method: "DELETE" }),

    getLiked: () => request("/liked-songs"),
    likeSong: (track) => request("/liked-songs", { method: "POST", body: track }),
    unlikeSong: (trackId) => request(`/liked-songs/${encodeURIComponent(trackId)}`, { method: "DELETE" }),

    getPlaylists: () => request("/playlists"),
    getPlaylist: (id) => request(`/playlists/${id}`),
    createPlaylist: (payload) => request("/playlists", { method: "POST", body: payload }),
    deletePlaylist: (id) => request(`/playlists/${id}`, { method: "DELETE" }),
    addToPlaylist: (id, track) => request(`/playlists/${id}/tracks`, { method: "POST", body: track }),
    removeFromPlaylist: (id, trackId) =>
        request(`/playlists/${id}/tracks/${encodeURIComponent(trackId)}`, { method: "DELETE" }),
};
