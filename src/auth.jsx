import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken, setUnauthorizedHandler } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => { setToken(null); setUser(null); });
    if (!getToken()) { setReady(true); return; }
    api.me().then(setUser).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { user: u, token } = await api.login({ email, password });
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (body) => {
    const { user: u, token } = await api.register(body);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(() => ({ user, ready, signIn, register, logout }), [user, ready, signIn, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
