import React from "react";
import TrackRow from "../components/TrackRow";
import { useLibrary } from "../context/LibraryContext";
import { usePlayer } from "../context/PlayerContext";

export default function LikedSongs() {
    const { likedSongs } = useLibrary();
    const { playTracks } = usePlayer();

    const playable = likedSongs.filter((t) => t.previewUrl);

    return (
        <div>
            <header className="liked-header">
                <div className="liked-art">Liked</div>
                <div>
                    <div className="artist-eyebrow">Playlist</div>
                    <h1 className="artist-header-name">Liked Songs</h1>
                    <div className="artist-followers">
                        {likedSongs.length} song{likedSongs.length !== 1 ? "s" : ""}
                    </div>
                    <div className="artist-actions">
                        <button
                            className="play-btn play-btn-large"
                            onClick={() => playable.length && playTracks(playable, 0)}
                            disabled={!playable.length}
                        >
                            Play
                        </button>
                    </div>
                </div>
            </header>

            {likedSongs.length === 0 ? (
                <div className="empty-state">
                    <p>You haven&apos;t liked any songs yet.</p>
                    <p>Tap Like on any track to save it here.</p>
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
                    {likedSongs.map((t, i) => (
                        <TrackRow
                            key={t.trackId}
                            track={t}
                            index={i}
                            onPlay={(idx) => {
                                const startTrackId = likedSongs[idx].trackId;
                                const startInPlayable = playable.findIndex((x) => x.trackId === startTrackId);
                                playTracks(playable, Math.max(0, startInPlayable));
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
