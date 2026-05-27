/**
 * contexts/AuthContext.jsx
 * Fuente de verdad de autenticación, roles y llamadas a la API.
 *
 * Exporta:
 *  - user          → objeto del usuario autenticado (o null)
 *  - provider      → perfil del prestador (solo si role === PROVIDER)
 *  - isReady       → true cuando terminó de verificar el JWT local
 *  - login({ email, password })   → autentica, guarda JWT, retorna { user, redirectTo }
 *  - register({ name, email, password, role }) → crea cuenta
 *  - logout()                     → limpia sesión
 *  - refreshProvider()            → recarga perfil del prestador
 *  - apiRequest(path, opts)       → fetch con JWT automático
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
const TOKEN_KEY = "oya_token";

/** Ruta de dashboard según el rol */
export function dashboardByRole(role) {
  if (role === "PROVIDER") return "/providers/dashboard";
  if (role === "ADMIN")    return "/admin/dashboard";
  return "/client/dashboard";
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [provider, setProvider] = useState(null);
  const [isReady,  setIsReady]  = useState(false);

  // ── Fetch autenticado ─────────────────────────────────────────────────────
  const apiRequest = useCallback(async (path, opts = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    };
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(
      new Error(data?.error || `HTTP ${res.status}`),
      { status: res.status, data }
    );
    return data;
  }, []);

  // ── Cargar perfil del prestador ───────────────────────────────────────────
  const loadProviderProfile = useCallback(async (userId) => {
    try {
      const pd = await apiRequest(`/api/providers/by-user/${userId}`);
      setProvider(pd.provider || null);
    } catch {
      setProvider(null);
    }
  }, [apiRequest]);

  // ── Cargar usuario desde JWT guardado ─────────────────────────────────────
  const loadUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) { setIsReady(true); return; }
    try {
      const data = await apiRequest("/api/auth/me");
      const u = data.user || null;
      setUser(u);
      if (u?.role === "PROVIDER") await loadProviderProfile(u.id);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setIsReady(true);
    }
  }, [apiRequest, loadProviderProfile]);

  useEffect(() => { loadUser(); }, [loadUser]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!data.token) throw new Error("No se recibió token del servidor");
    localStorage.setItem(TOKEN_KEY, data.token);
    const u = data.user || null;
    setUser(u);
    if (u?.role === "PROVIDER") await loadProviderProfile(u.id);
    return { ...data, redirectTo: dashboardByRole(u?.role) };
  }, [apiRequest, loadProviderProfile]);

  // ── Registro ──────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, role = "CLIENT" }) => {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!data.token) throw new Error("No se recibió token del servidor");
    localStorage.setItem(TOKEN_KEY, data.token);
    const u = data.user || null;
    setUser(u);
    return { ...data, redirectTo: dashboardByRole(u?.role) };
  }, [apiRequest]);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setProvider(null);
  }, []);

  // ── Refresh prestador ─────────────────────────────────────────────────────
  const refreshProvider = useCallback(async () => {
    if (!user?.id) return;
    await loadProviderProfile(user.id);
  }, [user, loadProviderProfile]);

  return (
    <AuthContext.Provider value={{
      user, provider, isReady,
      login, register, logout, refreshProvider, apiRequest,
    }}>
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
