import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getUserToken, setUserToken, getStoredUser, setStoredUser } from "../lib/api";
import posthog from "posthog-js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Synchronous initialization from localStorage so the user is immediately recognized on new tabs/refresh
  const [user, setUser] = useState(() => {
    const token = getUserToken();
    if (!token) return null;
    return getStoredUser();
  });
  const [loading, setLoading] = useState(() => !getUserToken());

  // Tracks user session state changes cleanly
  useEffect(() => {
    if (user) {
      try {
        posthog.identify(user.id, {
          email: user.email,
          name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        });
      } catch {
        // ignore analytics failure
      }
    } else {
      try {
        posthog.reset();
      } catch {
        // ignore analytics failure
      }
    }
  }, [user]);

  // Sync session across multiple browser tabs
  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === "tgicet_user_token" || e.key === "tgicet_user_profile") {
        const token = getUserToken();
        const storedUser = getStoredUser();
        if (token && storedUser) {
          setUser(storedUser);
        } else if (!token) {
          setUser(null);
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Background session verification with server
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getUserToken();
      if (!token) {
        setUser(null);
        setStoredUser(null);
        setLoading(false);
        return;
      }

      if (token.startsWith("guest_token_")) {
        const stored = getStoredUser();
        if (stored) {
          setUser(stored);
        }
        setLoading(false);
        return;
      }

      try {
        const data = await api.get("/auth/me");
        if (!cancelled) {
          if (data.authenticated && data.user) {
            setUser(data.user);
            setStoredUser(data.user);
          } else {
            // Server explicitly says not authenticated
            setUserToken(null);
            setStoredUser(null);
            setUser(null);
          }
        }
      } catch (err) {
        // Only clear the saved token when the server has explicitly returned 401 Unauthorized.
        // For network timeouts, cold starts, or dropped connections, we keep the valid local session.
        if (err.status === 401) {
          setUserToken(null);
          setStoredUser(null);
          if (!cancelled) setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestUser = {
      id: "guest_" + Date.now(),
      email: "guest@tgcounselling.org",
      first_name: "Guest",
      last_name: "User",
      is_guest: true,
    };
    setUserToken("guest_token_" + Date.now());
    setStoredUser(guestUser);
    setUser(guestUser);
    return guestUser;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post("/auth/login", {
      email,
      password,
    });

    setUserToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await api.post("/auth/register", userData);
    setUserToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await api.post("/auth/google", { idToken });
    setUserToken(data.token);
    setStoredUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setUserToken(null);
    setStoredUser(null);
    setUser(null);
  }, []);

  // Updates first/last name
  const updateProfile = useCallback(async ({ firstName, lastName }) => {
    const data = await api.patch("/auth/profile", { firstName, lastName });
    setUser(data.user);
    setStoredUser(data.user);
    return data.user;
  }, []);

  // Changes the password for email/password accounts
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    const data = await api.patch("/auth/password", { currentPassword, newPassword });
    return data;
  }, []);

  // Kicks off the "forgot password" email
  const forgotPassword = useCallback(async (email) => {
    const data = await api.post("/auth/forgot-password", { email });
    return data;
  }, []);

  // Submits the new password with the reset token
  const resetPassword = useCallback(async ({ token, password }) => {
    const data = await api.post("/auth/reset-password", { token, password });
    return data;
  }, []);

  // Global Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const [authModalCallback, setAuthModalCallback] = useState(null);

  const openAuthModal = useCallback((mode = "login", onAuthenticated = null) => {
    setAuthModalMode(mode);
    setAuthModalCallback(() => onAuthenticated);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthModalCallback(null);
  }, []);

  const handleAuthModalSuccess = useCallback(() => {
    if (authModalCallback && typeof authModalCallback === "function") {
      authModalCallback();
    }
  }, [authModalCallback]);

  const value = {
    user,
    loading,
    login,
    loginAsGuest,
    register,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    handleAuthModalSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
