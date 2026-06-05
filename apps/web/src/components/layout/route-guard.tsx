'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, getDashboardRoute } from '@/lib/auth-context';

/**
 * Route-level access control based on the user's role.
 *
 * - No auth → redirect to /login
 * - User (unit) → blocked from admin-only routes
 * - Admin (director) → blocked from super-admin-only routes
 * - Super Admin → full access
 */

const SUPER_ADMIN_ONLY = ['/users', '/audit', '/admin'];
const ADMIN_AND_ABOVE = ['/dashboard'];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in → send to login
    if (!user) {
      router.replace('/login');
      return;
    }

    const fallback = getDashboardRoute(user.role);

    // Unit users cannot access admin routes
    if (user.role === 'user') {
      const blocked = [...SUPER_ADMIN_ONLY, ...ADMIN_AND_ABOVE, '/director-dashboard'];
      if (blocked.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
        router.replace(fallback);
        return;
      }
    }

    // Directors cannot access super-admin-only routes
    if (user.role === 'admin') {
      if (SUPER_ADMIN_ONLY.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
        router.replace(fallback);
        return;
      }
    }
  }, [user, isLoading, pathname, router]);

  // Show nothing while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent-200 border-t-accent-600 dark:border-slate-700 dark:border-t-accent-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading session…</p>
        </div>
      </div>
    );
  }

  // Not logged in — will redirect via useEffect
  if (!user) return null;

  return <>{children}</>;
}
