import { createContext, useContext, useState, useEffect } from "react";
import * as api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Set the token inside the API client and load user profile if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          api.setAuthToken(token);
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.error("Failed to load user:", err);
          // Token is expired or invalid
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      api.setAuthToken(data.access_token);
      const userData = await api.getMe();
      setUser(userData);
      return userData;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const userData = await api.register({ username, email, password });
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
