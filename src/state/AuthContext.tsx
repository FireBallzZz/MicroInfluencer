import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Role, User } from '../types';

type AuthCtx = {
  user: User | null;
  role: Role | null;
  login: (role: Role) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

const STORAGE_KEY = 'microinf_user';

const DEMO_USERS: Record<Role, User> = {
  creator: {
    id: 'u_creator',
    role: 'creator',
    fullName: 'Avery Johnson',
    email: 'avery@example.com',
    username: 'avery',
    avatarUrl: '',
  },
  brand: {
    id: 'u_brand',
    role: 'brand',
    fullName: 'Northwind Beverages',
    email: 'team@northwind.example.com',
    username: 'northwind',
    avatarUrl: '',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (role: Role) => setUser(DEMO_USERS[role]);
  const logout = () => setUser(null);

  return (
    <Ctx.Provider value={{ user, role: user?.role ?? null, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
