// src/context/PlayerContext.jsx
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
    const audioRef = useRef(new Audio());
    const [tracks, setTracks] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.7);

    const current = tracks[currentIndex] || null;

    // ---------- Play / Pause ----------
    const togglePlay = useCallback(() => {
        const a = audioRef.current;
        if (a.paused) {
            a.play().catch(() => {});
        } else {
            a.pause();
        }
    }, []);

    // ---------- Next / Prev ----------
    const next = useCallback(() => {
        if (!tracks.length) return;
        setCurrentIndex((i) => (i + 1) % tracks.length);
    }, [tracks]);

    const prev = useCallback(() => {
        if (!tracks.length) return;
        setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
    }, [tracks]);

    // ---------- Seek / Volume ----------
    const seek = useCallback((t) => {
        audioRef.current.currentTime = t;
        setProgress(t);
    }, []);

    const setVolume = useCallback((v) => {
        audioRef.current.volume = v;
        setVolumeState(v);
    }, []);

    // ---------- Start playing a new list ----------
    const playTracks = useCallback((newTracks, index = 0) => {
        setTracks(newTracks);
        setCurrentIndex(index);
    }, []);

    // ---------- Load & play whenever the current track changes ----------
    useEffect(() => {
        const a = audioRef.current;
        if (!current || !current.previewUrl) {
            a.pause();
            a.src = "";
            setIsPlaying(false);
            setProgress(0);
            setDuration(0);
            return;
        }
        // Resolve relative URLs (e.g. /api/music/audio?...) to full backend URL
        let src = current.previewUrl;
        if (src.startsWith("/")) {
            const base = import.meta.env.VITE_API_BASE || "http://localhost:5000";
            // Strip /api from base if present, since previewUrl already starts with /api
            src = base.replace(/\/api$/, "") + src;
        }
        a.src = src;
        a.volume = volume;
        a.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current?.trackId]);

    // ---------- Wire up audio events ----------
    useEffect(() => {
        const a = audioRef.current;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onTime = () => setProgress(a.currentTime);
        const onMeta = () => setDuration(a.duration);
        const onEnded = () => {
            // auto-advance to next track
            if (tracks.length > 1) {
                setCurrentIndex((i) => (i + 1) % tracks.length);
            } else {
                setIsPlaying(false);
            }
        };

        a.addEventListener("play", onPlay);
        a.addEventListener("pause", onPause);
        a.addEventListener("timeupdate", onTime);
        a.addEventListener("loadedmetadata", onMeta);
        a.addEventListener("ended", onEnded);

        return () => {
            a.removeEventListener("play", onPlay);
            a.removeEventListener("pause", onPause);
            a.removeEventListener("timeupdate", onTime);
            a.removeEventListener("loadedmetadata", onMeta);
            a.removeEventListener("ended", onEnded);
        };
    }, [tracks]);

    return (
        <PlayerContext.Provider value={{
            tracks, currentIndex, current,
            isPlaying, progress, duration, volume,
            playTracks, togglePlay, next, prev, seek, setVolume,
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    return useContext(PlayerContext);
}