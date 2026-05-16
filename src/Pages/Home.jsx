import React from "react";
import SingerCard from "../components/SingerCard";
import { trendingArtists } from "../data/artists";
import { getArtistByQuery, getArtistTopTracks } from "../spotify";
import { usePlayer } from "../context/PlayerContext";

export default function Home() {
    const { playTracks } = usePlayer();

    const playArtist = async (artistName) => {
        try {
            const artist = await getArtistByQuery(artistName);
            if (!artist) return alert("Artist not found.");
            const top = await getArtistTopTracks(artist.id);
            const playable = top.tracks.filter((t) => t.previewUrl);
            if (!playable.length) return alert("No previews available for this artist.");
            playTracks(playable, 0);
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div>
            <section>
                <h1 className="page-title">Trending</h1>
                <div className="grid-container">
                    {trendingArtists.map((a) => (
                        <SingerCard
                            key={a.name}
                            name={a.name}
                            image={a.image}
                            onPlay={playArtist}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
