import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
                Explore
            </NavLink>
            <NavLink to="/favourites" className={({ isActive }) => (isActive ? "active" : "")}>
                Favourites
            </NavLink>
            <NavLink to="/playlists" className={({ isActive }) => (isActive ? "active" : "")}>
                My playlist
            </NavLink>

            {user ? (
                <>
                    <span className="nav-user">Hi, {user.fullName?.split(" ")[0] || "User"}</span>
                    <button className="nav-link-btn" onClick={handleLogout}>Log Out</button>
                </>
            ) : (
                <>
                    <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                        Log In
                    </NavLink>
                    <NavLink to="/signin" className={({ isActive }) => (isActive ? "active" : "")}>
                        Sign In
                    </NavLink>
                </>
            )}
        </nav>
    );
}
