'use client';

import { Bell, HelpCircle, Search, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '../theme-toggle';
import { useAuth, getRoleLabel } from '@/lib/auth-context';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Administrative Console',
  '/director-dashboard': 'Directorate Dashboard',
  '/user-dashboard': 'User Portal Dashboard',
  '/strategy': 'NHSSP — Strategic Plan',
  '/awps': 'Annual Work Plans',
  '/programmes': 'Programmes',
  '/monitoring': 'Monitoring & Evaluation',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/audit': 'Audit Log',
  '/admin': 'Platform Settings',
};

export function Topbar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const baseRoute = '/' + (pathname.split('/')[1] ?? '');
  const pageTitle = routeTitles[baseRoute] ?? 'NHPMBR';

  const isAdminView =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/admin');

  // Avatar initials
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  // Role colors
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const gradient = isSuperAdmin
    ? 'from-amber-500 to-amber-700'
    : isAdmin
      ? 'from-accent-600 to-accent-800'
      : 'from-blue-600 to-blue-800';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate">{pageTitle}</h2>
        <span className="hidden sm:inline-flex badge-blue text-[10px]">FY 2026</span>
        {isAdminView && (
          <span className="hidden sm:inline-flex badge-amber text-[9px] font-bold uppercase tracking-wider">
            Secure Admin
          </span>
        )}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md ml-auto">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <input
          type="search"
          placeholder="Search plans, activities, indicators..."
          className="input pl-9 py-2 text-sm bg-slate-50/80 border-slate-200 focus:bg-white dark:bg-slate-800/80 dark:border-slate-700 dark:focus:bg-slate-900 dark:text-white"
          aria-label="Search platform"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Help"
          title="Help & Documentation"
        >
          <HelpCircle className="h-[18px] w-[18px] text-slate-500 dark:text-slate-400" />
        </button>

        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px] text-slate-500 dark:text-slate-400" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        <div className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User avatar */}
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group">
          <div
            className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white shadow-sm bg-gradient-to-br ${gradient}`}
            title={user ? getRoleLabel(user.role) : 'User'}
          >
            {initials}
          </div>
          <div className="hidden lg:block">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-250 leading-tight">
              {user?.name || 'Loading...'}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
              {user?.role ? getRoleLabel(user.role) : '—'} {user?.directorateCode && `· ${user.directorateCode}`}
            </div>
          </div>
          <button
            onClick={signOut}
            className="ml-2 hidden h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700 group-hover:grid dark:hover:bg-slate-700 dark:hover:text-slate-200"
            title="Sign out (dev)"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
