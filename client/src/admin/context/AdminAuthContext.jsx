import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminApi, getAdminToken, setAdminToken } from "../../lib/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getAdminToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await adminApi.get("/admin/auth/me");
        if (!cancelled) setAdmin(data.admin);
      } catch {
        // token invalid/expired — clear it silently, treat as logged out
        setAdminToken(null);
        if (!cancelled) setAdmin(null);
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
    const data = await adminApi.post("/admin/auth/login", { email, password });
    setAdminToken(data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    setAdminToken(null);
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}