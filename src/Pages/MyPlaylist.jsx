import React, { useState } from "react";
import TrackRow from "../components/TrackRow";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";

export default function MyPlaylist() {
    const { playlists, createPlaylist, deletePlaylist, removeFromPlaylist } = useLibrary();
    const { playTracks } = usePlayer();

    const [name, setName] = useState("");
    const [openId, setOpenId] = useState(null);
    const [busy, setBusy] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        setBusy(true);
        try {
            const pl = await createPlaylist(trimmed);
            setName("");
            setOpenId(pl._id);
        } catch (err) { alert(err.message); }
        finally { setBusy(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this playlist?")) return;
        try {
            await deletePlaylist(id);
            if (openId === id) setOpenId(null);
        } catch (e) { alert(e.message); }
    };

    const open = playlists.find((p) => p._id === openId);

    return (
        <div>
            <h1 className="page-title">My Playlists</h1>

            <form className="playlist-create" onSubmit={handleCreate}>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="New playlist name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="auth-button" disabled={busy || !name.trim()}>
                    {busy ? "Creating…" : "Create"}
                </button>
            </form>

            {playlists.length === 0 ? (
                <div className="empty-state">
                    <p>You don&apos;t have any playlists yet.</p>
                    <p>Create one above, then add tracks from any artist page.</p>
                </div>
            ) : (
                <div className="playlist-grid">
                    {playlists.map((p) => (
                        <div
                            key={p._id}
                            className={`playlist-card ${openId === p._id ? "open" : ""}`}
                            onClick={() => setOpenId(p._id === openId ? null : p._id)}
                        >
                            <div className="playlist-card-name">{p.name}</div>
                            <div className="playlist-card-count">
                                {p.tracks.length} track{p.tracks.length !== 1 ? "s" : ""}
                            </div>
                            <button
                                className="playlist-delete"
                                onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {open && (
                <div className="playlist-detail">
                    <header className="liked-header">
                        <div className="liked-art liked-art-blue">♪</div>
                        <div>
                            <div className="artist-eyebrow">Playlist</div>
                            <h2 className="artist-header-name">{open.name}</h2>
                            <div className="artist-followers">
                                {open.tracks.length} song{open.tracks.length !== 1 ? "s" : ""}
                            </div>
                            <div className="artist-actions">
                                <button
                                    className="play-btn play-btn-large"
                                    onClick={() => {
                                        const playable = open.tracks.filter((t) => t.previewUrl);
                                        if (playable.length) playTracks(playable, 0);
                                    }}
                                    disabled={!open.tracks.some((t) => t.previewUrl)}
                                >
                                    ▶ Play
                                </button>
                            </div>
                        </div>
                    </header>

                    {open.tracks.length === 0 ? (
                        <div className="empty-state">
                            <p>This playlist is empty.</p>
                            <p>Open an artist, then use the ⋯ menu on any track to add it here.</p>
                        </div>
                    ) : (
                        <div className="track-list">
                            <div className="track-row track-head">
                                <div className="track-index">#</div>
                                <div className="track-image" />
                                <div className="track-meta">Title</div>
                                <div className="track-album">Album</div>
                                <div className="track-duration">Time</div>
                                <div />
                            </div>
                            {open.tracks.map((t, i) => (
                                <TrackRow
                                    key={t.trackId}
                                    track={t}
                                    index={i}
                                    playlistId={open._id}
                                    onPlay={(idx) => {
                                        const playable = open.tracks.filter((x) => x.previewUrl);
                                        const startId = open.tracks[idx].trackId;
                                        const start = playable.findIndex((x) => x.trackId === startId);
                                        playTracks(playable, Math.max(0, start));
                                    }}
                                    onRemove={(trackId) => removeFromPlaylist(open._id, trackId)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
