import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getUserToken, setUserToken } from "../lib/api";
import posthog from "posthog-js"; // Imported PostHog

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tracks user session state changes cleanly without altering your existing flows
  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      });
    } else {
      posthog.reset();
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getUserToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get("/auth/me");
        if (!cancelled) setUser(data.authenticated ? data.user : null);
      } catch {
        setUserToken(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.post("/auth/login", {
      email,
      password,
    });

    setUserToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await api.post("/auth/register", userData);
    setUserToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    const data = await api.post("/auth/google", { idToken });

    if (data.needsRegistration) {
      return data;
    }

    setUserToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setUserToken(null);
    setUser(null);
  }, []);

  // Updates first/last name. Requires the user to be logged in (token sent
  // automatically by `api`, same as the /auth/me call above).
  const updateProfile = useCallback(async ({ firstName, lastName }) => {
    const data = await api.patch("/auth/profile", { firstName, lastName });
    setUser(data.user);
    return data.user;
  }, []);

  // Changes the password for email/password accounts. Throws (with
  // err.message from the API) on wrong current password, etc.
  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    const data = await api.patch("/auth/password", { currentPassword, newPassword });
    return data;
  }, []);

  // Kicks off the "forgot password" email. Always resolves the same way
  // whether or not the email exists — the backend intentionally doesn't
  // reveal that, so don't try to branch UI on the response either.
  const forgotPassword = useCallback(async (email) => {
    const data = await api.post("/auth/forgot-password", { email });
    return data;
  }, []);

  // Completes a reset using the token from the emailed link.
  const resetPassword = useCallback(async ({ token, newPassword }) => {
    const data = await api.post("/auth/reset-password", { token, newPassword });
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
