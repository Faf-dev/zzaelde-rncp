import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie le token JWT au montage
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // On considère l'utilisateur connecté s'il a un token
      setUser({ username: "admin" });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await authApi.connexion(username, password);
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
