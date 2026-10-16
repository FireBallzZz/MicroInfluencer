import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import type { Role, User } from '../types';
import * as api from '../api/endpoints';
import { ApiError, getToken, setToken, isApiError } from '../api/client';

type AuthCtx = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  /** True when the app has tried to rehydrate the session. */
  ready: boolean;
  login: (input: { identifier: string; password: string }) => Promise<User>;
  registerCreator: (input: { fullName: string; email: string; username: string; password: string; mobileNumber: string }) => Promise<User>;
  registerBrand: (input: { fullName: string; email: string; username: string; password: string; mobileNumber: string }) => Promise<User>;
  logout: () => Promise<void>;
  /** Internal — used by the API client when a 401 comes back. */
  clearSession: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

const STORAGE_KEY = 'microinf_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  // Rehydrate: if we have a token but no user, fetch /me to confirm.
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
        // Network errors: keep the stored user so a future page load can try again.
      } finally {
        if (!cancelled) setReady(true);
      }
    };
    rehydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (input: { identifier: string; password: string }) => {
    setLoading(true);
    try {
      const { access, user: u } = await api.login(input);
      setToken(access);
      setUser(u);
      return u;
    } catch (err) {
      if (isApiError(err) && err.status === 401) {
        throw new ApiError({
          status: 401,
          code: 'invalid_credentials',
          message: 'Incorrect email/username or password.',
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerCreator = useCallback(
    async (input: { fullName: string; email: string; username: string; password: string; mobileNumber: string }) => {
      setLoading(true);
      try {
        return await api.register({ role: 'creator', ...input });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const registerBrand = useCallback(
    async (input: { fullName: string; email: string; username: string; password: string; mobileNumber: string }) => {
      setLoading(true);
      try {
        return await api.register({ role: 'brand', ...input });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // best-effort; clear locally even if the request fails
    }
    clearSession();
  }, [clearSession]);

  return (
    <Ctx.Provider
      value={{
        user,
        role: user?.role ?? null,
        loading,
        ready,
        login,
        registerCreator,
        registerBrand,
        logout,
        clearSession,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
