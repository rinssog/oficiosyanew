/**
 * contexts/AuthContext.jsx
 * Context central de autenticación y llamadas a la API.
 *
 * Provee:
 *  - user          → objeto del usuario autenticado (o null)
 *  - provider      → perfil del prestador (solo si role === PROVIDER)
 *  - isReady       → true cuando terminó de verificar el JWT local
 *  - login(email, password)  → autentica y guarda el JWT
 *  - logout()                → limpia el JWT y el estado
 *  - apiRequest(path, opts)  → fetch con JWT automático + base URL
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const TOKEN_KEY = "oya_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [provider, setProvider] = useState(null);
  const [isReady,  setIsReady]  = useState(false);

  // ── Helper fetch con JWT ──────────────────────────────────────────────────
  const apiRequest = useCallback(async (path, opts = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    };
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), { status: res.status, data });
    return data;
  }, []);

  // ── Cargar usuario desde JWT guardado ─────────────────────────────────────
  const loadUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) { setIsReady(true); return; }
    try {
      const data = await apiRequest("/api/auth/me");
      setUser(data.user || null);
      // Si es prestador, cargar su perfil
      if (data.user?.role === "PROVIDER") {
        try {
          const pd = await apiRequest(`/api/providers/by-user/${data.user.id}`);
          setProvider(pd.provider || null);
        } catch {}
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, [apiRequest]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!data.token) throw new Error("No se recibió token");
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user || null);
    if (data.user?.role === "PROVIDER") {
      try {
        const pd = await apiRequest(`/api/providers/by-user/${data.user.id}`);
        setProvider(pd.provider || null);
      } catch {}
    }
    return data;
  }, [apiRequest]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setProvider(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, provider, isReady, login, logout, apiRequest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}

export default AuthContext;
