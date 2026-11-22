import { createContext, useContext, useEffect, useState } from "react";
import { API_URL, authFetch } from "../../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Synchronize authentication state on initial load
  useEffect(() => {
    const verifyExistingAuth = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authFetch("/api/auth/me");
        if (response.ok) {
          const result = await response.json();
          setUser(result.data);
          localStorage.setItem("user", JSON.stringify(result.data));
        } else {
          // Token is invalid or expired
          logout();
        }
      } catch (err) {
        console.error("Auth verification failed:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyExistingAuth();

    // Listen for global logout events triggered by 401s in authFetch
    const handleGlobalLogout = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth:logout", handleGlobalLogout);
    return () => window.removeEventListener("auth:logout", handleGlobalLogout);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to log in");
    }

    const { user: userData, token: jwtToken } = result.data;
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);

    return result;
  };

  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to register");
    }

    const { user: userData, token: jwtToken } = result.data;
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);

    return result;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    login,
    register,
    logout,
    authFetch,
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
