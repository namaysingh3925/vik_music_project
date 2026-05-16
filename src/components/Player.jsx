import React from "react";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";

const fmt = (s) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
};

export default function Player() {
    const { current, isPlaying, progress, duration, volume,
        togglePlay, next, prev, seek, setVolume } = usePlayer();
    const { user } = useAuth();
    const { isLiked, toggleLike } = useLibrary();

    if (!current) {
        return (
            <footer className="player-footer">
                <p className="player-empty">Choose a song to start playing</p>
            </footer>
        );
    }

    const liked = isLiked(current.trackId);
    const handleLike = async () => {
        if (!user) return alert("Please log in to like songs.");
        try { await toggleLike(current); } catch (e) { alert(e.message); }
    };

    return (
        <footer className="player-footer">
            <div className="player-track">
                {current.image && <img src={current.image} alt="" className="player-art" />}
                <div className="player-info">
                    <div className="player-name">{current.name}</div>
                    <div className="player-artist">{current.artist}</div>
                </div>
                <button className={`like-btn ${liked ? "is-liked" : ""}`} onClick={handleLike}>
                    {liked ? "♥" : "♡"}
                </button>
            </div>

            <div className="player-center">
                <div className="player-controls">
                    <button className="ctrl-btn" onClick={prev} title="Previous">⏮</button>
                    <button className="ctrl-btn ctrl-play" onClick={togglePlay} title="Play / Pause">
                        {isPlaying ? "❚❚" : "▶"}
                    </button>
                    <button className="ctrl-btn" onClick={next} title="Next">⏭</button>
                </div>
                <div className="player-seek">
                    <span className="seek-time">{fmt(progress)}</span>
                    <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={Math.min(progress, duration || 0)}
                        onChange={(e) => seek(parseFloat(e.target.value))}
                        className="seek-bar"
                    />
                    <span className="seek-time">{fmt(duration)}</span>
                </div>
                {!current.previewUrl && (
                    <div className="player-warning">No preview available for this track.</div>
                )}
            </div>

            <div className="player-right">
                <span className="vol-icon">🔊</span>
                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="vol-bar"
                />
            </div>
        </footer>
    );
}
