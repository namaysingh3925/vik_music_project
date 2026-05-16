import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";

export default function SingerCard({ name, image, onPlay }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isFavorite, toggleFavorite } = useLibrary();
    const [imgBroken, setImgBroken] = useState(false);

    const fav = isFavorite(name);

    const open = () => navigate(`/artist/${encodeURIComponent(name)}`);

    const handlePlay = (e) => {
        e.stopPropagation();
        if (onPlay) return onPlay(name);
        navigate(`/artist/${encodeURIComponent(name)}`);
    };

    const handleFav = async (e) => {
        e.stopPropagation();
        if (!user) {
            alert("Please log in to favourite artists.");
            return;
        }
        try {
            await toggleFavorite({ name, image });
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="artist-card" onClick={open} role="button">
            <button
                className={`fav-btn ${fav ? "is-fav" : ""}`}
                onClick={handleFav}
                title={fav ? "Remove from favourites" : "Add to favourites"}
            >
                {fav ? "Saved" : "Save"}
            </button>

            <div className="circle-avatar">
                {image && !imgBroken ? (
                    <img
                        src={image}
                        alt={name}
                        onError={() => {
                            console.warn("Artist image failed to load:", name, image);
                            setImgBroken(true);
                        }}
                    />
                ) : (
                    <div className="avatar-fallback">{name?.[0] || "?"}</div>
                )}
            </div>
            <div className="artist-info">
                <p className="artist-name">{name}</p>
                <button className="play-btn" onClick={handlePlay}>Play</button>
            </div>
        </div>
    );
}
