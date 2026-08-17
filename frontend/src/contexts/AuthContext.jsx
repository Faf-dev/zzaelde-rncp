import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifie le token JWT au montage
  useEffect(() => {
    const sessionActive = localStorage.getItem("is_logged_in");
    if (sessionActive === "true") {
      setUser({ username: "Zzaelde" });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await authApi.connexion(username, password);
    // On ne stocke plus le token (il est dans le cookie)
    // On stocke juste un petit drapeau pour que le front sache qu'on est connecté au f5
    localStorage.setItem("is_logged_in", "true");
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      // On demande au serveur de supprimer le cookie
      await authApi.deconnexion();
    } catch(e) {
      console.error(e);
    }
    localStorage.removeItem("is_logged_in");
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
