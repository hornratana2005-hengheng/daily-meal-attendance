import { useEffect, useState } from "react";

import { apiRequest } from "../api";
import AuthContext from "./AuthContext";

const TOKEN_KEY = "mealtrack_access_token";

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    let active = true;

    if (!token) {
      return () => {
        active = false;
      };
    }

    async function loadUser() {
      setLoading(true);
      try {
        const currentUser = await apiRequest("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) {
          setUser(currentUser);
        }
      } catch (requestError) {
        if (requestError.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
        }
        if (active && requestError.status === 401) {
          setToken(null);
          setUser(null);
        } else if (active) {
          setSessionError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, [token]);

  const authenticate = async (path, credentials) => {
    setSessionError("");
    const result = await apiRequest(path, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    localStorage.setItem(TOKEN_KEY, result.access_token);
    setUser(result.user);
    setToken(result.access_token);
    return result.user;
  };

  const signUp = (details) => authenticate("/api/auth/signup", details);
  const logIn = (credentials) => authenticate("/api/auth/login", credentials);

  const logOut = async () => {
    const currentToken = token;
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);

    if (currentToken) {
      await apiRequest("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, sessionError, signUp, logIn, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
