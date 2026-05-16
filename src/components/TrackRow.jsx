import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";

const fmtMs = (ms) => {
    if (!ms) return "-";
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export default function TrackRow({ track, index, onPlay, onRemove, playlistId }) {
    const { current, isPlaying, togglePlay } = usePlayer();
    const { user } = useAuth();
    const { isLiked, toggleLike, playlists, addToPlaylist } = useLibrary();
    const [menuOpen, setMenuOpen] = useState(false);

    const isCurrent = current && current.trackId === track.trackId;
    const liked = isLiked(track.trackId);

    const handlePlay = () => {
        if (isCurrent) {
            togglePlay();
        } else if (onPlay) {
            onPlay(index);
        }
    };

    const handleLike = async () => {
        if (!user) return alert("Please log in to like songs.");
        try { await toggleLike(track); } catch (e) { alert(e.message); }
    };

    const handleAddToPlaylist = async (id) => {
        try {
            await addToPlaylist(id, track);
            setMenuOpen(false);
        } catch (e) { alert(e.message); }
    };

    return (
        <div className={`track-row ${isCurrent ? "is-current" : ""}`}>
            <div className="track-index">
                <button className="track-play" onClick={handlePlay} disabled={!track.previewUrl}>
                    {isCurrent && isPlaying ? "Pause" : "Play"}
                </button>
            </div>
            <div className="track-image">
                {track.image && <img src={track.image} alt="" />}
            </div>
            <div className="track-meta">
                <div className="track-name">{track.name}</div>
                <div className="track-artist">{track.artist}</div>
            </div>
            <div className="track-album">{track.album}</div>
            <div className="track-duration">{fmtMs(track.durationMs)}</div>
            <button className={`like-btn ${liked ? "is-liked" : ""}`} onClick={handleLike} title="Like">
                {liked ? "Liked" : "Like"}
            </button>
            {user && (
                <div className="track-menu-wrap">
                    <button className="track-menu" onClick={() => setMenuOpen((o) => !o)}>...</button>
                    {menuOpen && (
                        <div className="track-menu-pop" onMouseLeave={() => setMenuOpen(false)}>
                            <div className="menu-label">Add to playlist</div>
                            {playlists.length === 0 && <div className="menu-empty">No playlists yet</div>}
                            {playlists.map((pl) => (
                                <button key={pl._id} onClick={() => handleAddToPlaylist(pl._id)}>
                                    {pl.name}
                                </button>
                            ))}
                            {playlistId && onRemove && (
                                <>
                                    <hr />
                                    <button onClick={() => { onRemove(track.trackId); setMenuOpen(false); }}>
                                        Remove from this playlist
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
