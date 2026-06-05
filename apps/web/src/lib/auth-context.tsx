'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

/* ──── Role & User Types ──── */

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
  /** Set for 'admin' (director) and 'user' (unit) roles */
  directorate?: string;
  /** Short code e.g. 'DPPI', 'DPHC' */
  directorateCode?: string;
  /** Set for 'user' (unit) role only */
  unitName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** Sign in with a dev-mode user profile (stores in localStorage) */
  devSignIn: (user: AuthUser) => void;
  /** Clear session */
  signOut: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'nhpmbr_dev_auth';

const AuthContext = createContext<AuthContextValue>({
  user: null,
  devSignIn: () => {},
  signOut: () => {},
  isLoading: true,
});

/* ──── Provider ──── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        if (parsed && parsed.role && parsed.name) {
          setUser(parsed);
        }
      }
    } catch {
      // ignore corrupt data
    }
    setIsLoading(false);
  }, []);

  const devSignIn = useCallback((profile: AuthUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    setUser(profile);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, devSignIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ──── Hook ──── */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

/* ──── Role Helpers ──── */

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Director';
    case 'user': return 'Unit Account';
  }
}

export function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case 'super_admin': return 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30';
    case 'admin': return 'bg-accent-50 text-accent-700 ring-1 ring-accent-600/20 dark:bg-accent-950/40 dark:text-accent-300 dark:ring-accent-500/20';
    case 'user': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/20';
  }
}

export function getDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'super_admin': return '/dashboard';
    case 'admin': return '/director-dashboard';
    case 'user': return '/user-dashboard';
  }
}
