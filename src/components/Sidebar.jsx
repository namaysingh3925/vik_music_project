import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
    const [q, setQ] = useState("");
    const navigate = useNavigate();

    const onSubmit = (e) => {
        e.preventDefault();
        const term = q.trim();
        if (!term) return;
        navigate(`/search?q=${encodeURIComponent(term)}`);
    };

    return (
        <aside className="sidebar">
            <form onSubmit={onSubmit}>
                <input
                    type="text"
                    placeholder="Search artists or songs"
                    className="search-bar"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </form>
            <ul className="menu">
                <li>
                    <NavLink to="/" end className={({ isActive }) => (isActive ? "menu-active" : "")}>
                        Explore
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/favourites" className={({ isActive }) => (isActive ? "menu-active" : "")}>
                        Favourites
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/liked" className={({ isActive }) => (isActive ? "menu-active" : "")}>
                        Liked songs
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/playlists" className={({ isActive }) => (isActive ? "menu-active" : "")}>
                        My playlist
                    </NavLink>
                </li>
            </ul>
        </aside>
    );
}
