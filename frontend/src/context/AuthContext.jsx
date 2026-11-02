import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ffas_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("ffas_token", data.data.token);
      localStorage.setItem("ffas_user", JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to sign in. Please try again.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (studentData) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", studentData);
      localStorage.setItem("ffas_token", data.data.token);
      localStorage.setItem("ffas_user", JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data.data.user;
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to register. Please try again.";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ffas_token");
    localStorage.removeItem("ffas_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, loading, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
