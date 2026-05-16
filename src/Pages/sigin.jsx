import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signin() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: "", email: "", phone: "", password: "", confirm: "",
    });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        setErr("");
        if (form.password.length < 6) {
            return setErr("Password must be at least 6 characters");
        }
        if (form.password !== form.confirm) {
            return setErr("Passwords don't match");
        }
        setLoading(true);
        try {
            await signup({
                fullName: form.fullName,
                email: form.email,
                phone: form.phone,
                password: form.password,
            });
            navigate("/");
        } catch (e) {
            setErr(e.message || "Sign up failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create account</h2>
                <p className="auth-subtitle">Sign up to save favourites and build playlists.</p>

                {err && <div className="auth-error">{err}</div>}

                <form className="auth-form" onSubmit={submit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" placeholder="John Doe" required
                            value={form.fullName} onChange={set("fullName")} />
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label>Email</label>
                            <input type="email" placeholder="you@example.com" required
                                value={form.email} onChange={set("email")} />
                        </div>
                        <div className="input-group">
                            <label>Phone (optional)</label>
                            <input type="tel" placeholder="555-0100"
                                value={form.phone} onChange={set("phone")} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" required minLength={6}
                            value={form.password} onChange={set("password")} />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input type="password" placeholder="••••••••" required
                            value={form.confirm} onChange={set("confirm")} />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? "Creating…" : "Sign Up"}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    );
}
