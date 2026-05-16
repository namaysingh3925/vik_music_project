import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [playlists, setPlaylists] = useState([]);

    // Refresh whenever the user changes (login / logout)
    useEffect(() => {
        if (!user) {
            setFavorites([]);
            setLikedSongs([]);
            setPlaylists([]);
            return;
        }
        api.getFavorites().then((d) => setFavorites(d.favorites || [])).catch(() => {});
        api.getLiked().then((d) => setLikedSongs(d.likedSongs || [])).catch(() => {});
        api.getPlaylists().then((d) => setPlaylists(d.playlists || [])).catch(() => {});
    }, [user]);

    const isFavorite = useCallback(
        (name) => favorites.some((f) => f.name.toLowerCase() === (name || "").toLowerCase()),
        [favorites],
    );
    const isLiked = useCallback(
        (trackId) => likedSongs.some((s) => s.trackId === trackId),
        [likedSongs],
    );

    const toggleFavorite = useCallback(async (artist) => {
        if (!user) throw new Error("Please log in first");
        if (isFavorite(artist.name)) {
            const d = await api.removeFavorite(artist.name);
            setFavorites(d.favorites);
        } else {
            const d = await api.addFavorite(artist);
            setFavorites(d.favorites);
        }
    }, [isFavorite, user]);

    const toggleLike = useCallback(async (track) => {
        if (!user) throw new Error("Please log in first");
        if (isLiked(track.trackId)) {
            const d = await api.unlikeSong(track.trackId);
            setLikedSongs(d.likedSongs);
        } else {
            const d = await api.likeSong(track);
            setLikedSongs(d.likedSongs);
        }
    }, [isLiked, user]);

    const createPlaylist = useCallback(async (name) => {
        const d = await api.createPlaylist({ name });
        setPlaylists((p) => [d.playlist, ...p]);
        return d.playlist;
    }, []);

    const deletePlaylist = useCallback(async (id) => {
        await api.deletePlaylist(id);
        setPlaylists((p) => p.filter((pl) => pl._id !== id));
    }, []);

    const addToPlaylist = useCallback(async (id, track) => {
        const d = await api.addToPlaylist(id, track);
        setPlaylists((p) => p.map((pl) => (pl._id === id ? d.playlist : pl)));
        return d.playlist;
    }, []);

    const removeFromPlaylist = useCallback(async (id, trackId) => {
        const d = await api.removeFromPlaylist(id, trackId);
        setPlaylists((p) => p.map((pl) => (pl._id === id ? d.playlist : pl)));
        return d.playlist;
    }, []);

    return (
        <LibraryContext.Provider
            value={{
                favorites, likedSongs, playlists,
                isFavorite, isLiked,
                toggleFavorite, toggleLike,
                createPlaylist, deletePlaylist, addToPlaylist, removeFromPlaylist,
            }}
        >
            {children}
        </LibraryContext.Provider>
    );
}

export const useLibrary = () => useContext(LibraryContext);
