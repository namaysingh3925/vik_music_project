import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getArtistByQuery, getArtistInfo, getArtistTopTracks } from "../spotify";
import { usePlayer } from "../context/PlayerContext";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import TrackRow from "../components/TrackRow";

export default function Artist() {
    const { name } = useParams();
    const artistName = decodeURIComponent(name);
    const { playTracks } = usePlayer();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useLibrary();

    const [artist, setArtist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const a = await getArtistByQuery(artistName);
                if (!a) throw new Error("Artist not found.");

                const [info, topData] = await Promise.all([
                    getArtistInfo(a.id),
                    getArtistTopTracks(a.id),
                ]);

                if (cancelled) return;
                setArtist({
                    id: info.id,
                    name: info.name,
                    image: info.image,
                    followers: info.followers,
                });
                setTracks(topData.tracks);
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [artistName]);

    const playAll = () => {
        const playable = tracks.filter((t) => t.previewUrl);
        if (!playable.length) return alert("No previews available for this artist.");
        playTracks(playable, 0);
    };

    const handleFav = async () => {
        if (!user) return alert("Please log in to favourite this artist.");
        try {
            await toggleFavorite({ name: artist?.name || artistName, image: artist?.image });
        } catch (e) { alert(e.message); }
    };

    return (
        <div>
            <Link to="/" className="back-link">Back</Link>

            {loading && <div style={{ padding: 24 }}>Loading...</div>}

            {!loading && error && (
                <div className="info-banner">{error}</div>
            )}

            {!loading && artist && (
                <>
                    <header className="artist-header">
                        {artist.image && <img src={artist.image} alt={artist.name} className="artist-header-img" />}
                        <div className="artist-header-info">
                            <div className="artist-eyebrow">Artist</div>
                            <h1 className="artist-header-name">{artist.name}</h1>
                            {!!artist.followers && (
                                <div className="artist-followers">{artist.followers.toLocaleString()} fans</div>
                            )}
                            <div className="artist-actions">
                                <button className="play-btn play-btn-large" onClick={playAll}>Play</button>
                                <button
                                    className={`fav-btn-inline ${isFavorite(artist.name) ? "is-fav" : ""}`}
                                    onClick={handleFav}
                                >
                                    {isFavorite(artist.name) ? "In favourites" : "Add to favourites"}
                                </button>
                            </div>
                        </div>
                    </header>

                    <h2 className="section-title">Popular</h2>
                    <div className="track-list">
                        <div className="track-row track-head">
                            <div className="track-index">#</div>
                            <div className="track-image" />
                            <div className="track-meta">Title</div>
                            <div className="track-album">Album</div>
                            <div className="track-duration">Time</div>
                            <div />
                        </div>
                        {tracks.map((t, i) => (
                            <TrackRow
                                key={t.trackId}
                                track={t}
                                index={i}
                                onPlay={(idx) => {
                                    const playable = tracks.filter((x) => x.previewUrl);
                                    const start = playable.findIndex((x) => x.trackId === tracks[idx].trackId);
                                    playTracks(playable, Math.max(0, start));
                                }}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
