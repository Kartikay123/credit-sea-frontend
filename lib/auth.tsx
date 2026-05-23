'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from './api';
import { User, Role } from './types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('lms_token')
        : null;
    if (!token) {
      setLoading(false);
      return;
    }
    apiGet<{ user: User }>('/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem('lms_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user } = await apiPost<{ token: string; user: User }>(
      '/auth/login',
      { email, password }
    );
    localStorage.setItem('lms_token', token);
    setUser(user);
    return user;
  };

  const signup = async (name: string, email: string, password: string) => {
    const { token, user } = await apiPost<{ token: string; user: User }>(
      '/auth/signup',
      { name, email, password }
    );
    localStorage.setItem('lms_token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('lms_token');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function useRequireAuth(allowedRoles?: Role[]) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (allowedRoles && allowedRoles.length > 0) {
      if (user.role !== 'admin' && !allowedRoles.includes(user.role)) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router, allowedRoles]);
  return { user, loading };
}

export function landingPathForRole(role: Role): string {
  switch (role) {
    case 'borrower':
      return '/apply/details';
    case 'sales':
      return '/dashboard/sales';
    case 'sanction':
      return '/dashboard/sanction';
    case 'disbursement':
      return '/dashboard/disbursement';
    case 'collection':
      return '/dashboard/collection';
    case 'admin':
    default:
      return '/dashboard';
  }
}
