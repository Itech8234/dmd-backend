import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api.js';

const AuthCtx = createContext(null);

/**
 * Auth against the Django REST API (session cookie + CSRF).
 * The Django session is the single source of truth — nothing is
 * stored in localStorage except harmless UI preferences.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api('/auth/me');
      setUser(data.user || null);
    } catch (e) {
      setUser(null);
    }
    setReady(true);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (username, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { username, password } });
    if (data && data.requires_2fa) {
      const err = new Error('Verification code sent to your email.');
      err.status = 202;
      err.requires2fa = true;
      throw err;
    }
    setUser(data.user);
    return data.user;
  }, []);

  const verify2fa = useCallback(async (code, trust = false) => {
    const data = await api('/auth/verify-2fa', { method: 'POST', body: { code, trust } });
    setUser(data.user);
    return data.user;
  }, []);

  const resend2fa = useCallback(async () => {
    await api('/auth/resend-2fa', { method: 'POST' });
  }, []);

  const logout = useCallback(async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch (e) { /* session already gone */ }
    setUser(null);
  }, []);

  const isStaff = !!(user && (user.is_staff_role || user.is_superuser));

  return (
    <AuthCtx.Provider value={{ user, ready, isStaff, login, logout, refresh, verify2fa, resend2fa }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

