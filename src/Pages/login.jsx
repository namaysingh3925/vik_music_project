import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { redirectToAuthCodeFlow } from "../spotify";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (e) {
            setErr(e.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome back</h2>
                <p className="auth-subtitle">Log in to access your favourites and playlists.</p>

                {err && <div className="auth-error">{err}</div>}

                <form className="auth-form" onSubmit={submit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="auth-button" disabled={loading}>
                        {loading ? "Logging in…" : "Log In"}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

                <button
                    type="button"
                    onClick={redirectToAuthCodeFlow}
                    className="auth-button auth-spotify"
                >
                    Connect Spotify (for music previews)
                </button>

                <div className="auth-footer">
                    Don&apos;t have an account? <Link to="/signin">Sign up</Link>
                </div>
            </div>
        </div>
    );
}
