import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if we have a stored token and validate it
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            api.me()
                .then((data) => setUser(data.user || data))
                .catch(() => {
                    localStorage.removeItem("authToken");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const data = await api.login({ email, password });
        localStorage.setItem("authToken", data.token);
        setUser(data.user);
        return data;
    };

    const signup = async (payload) => {
        const data = await api.signup(payload);
        localStorage.setItem("authToken", data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("authToken");
        localStorage.removeItem("spotifyToken");
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
