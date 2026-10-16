import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import * as api from '../api/endpoints';
import type { User } from '../types';
import { getToken, setToken, isApiError } from '../api/client';

type AdminCtx = {
  user: User | null;
  loading: boolean;
  ready: boolean;
  login: (input: { identifier: string; password: string }) => Promise<User>;
  logout: () => void;
};

const Ctx = createContext<AdminCtx | undefined>(undefined);
const USER_KEY = 'microinf_admin_user';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    const rehydrate = async () => {
      if (!getToken()) {
        setReady(true);
        return;
      }
      try {
        const me = await api.fetchMe();
        if (cancelled) return;
        setUser(me);
      } catch (err) {
        if (cancelled) return;
        if (isApiError(err) && (err.status === 401 || err.status === 403)) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    rehydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: { identifier: string; password: string }) => {
    setLoading(true);
    try {
      const { access, user: u } = await api.adminLogin(input);
      setToken(access);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, ready, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
