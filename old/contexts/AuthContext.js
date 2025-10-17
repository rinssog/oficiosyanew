'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'oficiosya_auth';
const AuthContext = createContext(null);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

async function baseRequest(path, options = {}) {
  const { body, ...rest } = options || {};
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers = { ...(rest.headers || {}) };
  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  } else {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const fetchOptions = {
    ...rest,
    headers,
    body,
  };

  const res = await fetch(`${API_BASE}${path}`, fetchOptions);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const message = data.error || "Error inesperado";
    throw new Error(message);
  }
  return data;
}


export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, provider: null, token: null });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (stored) {
        setState(stored);
      }
    } catch (err) {
      console.warn('auth parse error', err);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isReady]);

  const value = useMemo(() => ({
    ...state,
    async apiRequest(path, options = {}) {
      const headers = { ...(options.headers || {}) };
      if (state.token && !headers["Authorization"]) {
        headers["Authorization"] = `Bearer ${state.token}`;
      }
      return baseRequest(path, { ...options, headers });
    },
    async register(payload) {
      const data = await baseRequest('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    },
    async login(payload) {
      const data = await baseRequest('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setState({ user: data.user, provider: data.provider, token: data.token });
      return data;
    },
    logout() {
      setState({ user: null, provider: null, token: null });
    },
    async refreshProvider(userId) {
      if (!userId) return null;
      const data = await baseRequest(`/api/providers/by-user/${userId}`);
      setState((prev) => ({ ...prev, provider: data.provider }));
      return data.provider;
    },
    async acceptTerms({ userId, contractType, version, nameSigned }) {
      const data = await baseRequest('/api/terms/accept', {
        method: 'POST',
        body: JSON.stringify({ userId, contractType, version, nameSigned }),
      });
      return data.acceptance;
    },
    async getUserTerms(userId, contractType = 'GENERAL') {
      if (!userId) return { latest: null, history: [] };
      return baseRequest(`/api/users/${userId}/terms?contractType=${contractType}`);
    },
    isReady,
  }), [state, isReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}


