import { createContext, useContext, useEffect, useState } from "react";

const API = "https://fsa-jwt-practice.herokuapp.com";
const STORAGE_KEY = "secret-tunnel-token";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [location, setLocation] = useState("GATE");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = sessionStorage.getItem(STORAGE_KEY);
    if (storedToken) {
      setToken(storedToken);
      setLocation("TABLET");
    }
  }, []);

  async function signup(username) {
    setError("");

    if (!username?.trim()) {
      const message = "Please enter your name.";
      setError(message);
      throw new Error(message);
    }

    const response = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password: username }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const message = data?.message || "Signup failed.";
      setError(message);
      throw new Error(message);
    }

    setToken(data.token);
    sessionStorage.setItem(STORAGE_KEY, data.token);
    setLocation("TABLET");
    setError("");
  }

  async function authenticate() {
    setError("");

    if (!token) {
      const message = "No token found. Please sign up first.";
      setError(message);
      throw new Error(message);
    }

    const response = await fetch(`${API}/authenticate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      const message = data?.message || "Authentication failed.";
      setError(message);
      throw new Error(message);
    }

    setLocation("TUNNEL");
    setError("");
  }

  const value = {
    location,
    token,
    error,
    signup,
    authenticate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
