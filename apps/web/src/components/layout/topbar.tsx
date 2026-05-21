'use client';

import { Bell, HelpCircle, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/strategy': 'Strategic Plan',
  '/awps': 'Annual Work Plans',
  '/programmes': 'Programmes',
  '/indicators': 'Indicators',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/audit': 'Audit Log',
  '/admin': 'Platform Settings',
};

export function Topbar() {
  const pathname = usePathname();
  const baseRoute = '/' + (pathname.split('/')[1] ?? '');
  const pageTitle = routeTitles[baseRoute] ?? 'NHPMBR';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-base font-semibold text-slate-800 truncate">{pageTitle}</h2>
        <span className="hidden sm:inline-flex badge-blue text-[10px]">FY 2026</span>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md ml-auto">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search plans, activities, indicators..."
          className="input pl-9 py-2 text-sm bg-slate-50/80 border-slate-200 focus:bg-white"
          aria-label="Search platform"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Help"
          title="Help & Documentation"
        >
          <HelpCircle className="h-[18px] w-[18px] text-slate-500" />
        </button>

        <button
          type="button"
          className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="h-[18px] w-[18px] text-slate-500" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
        </button>

        <div className="mx-2 h-6 w-px bg-slate-200" />

        {/* User avatar */}
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors cursor-pointer">
          <div
            className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white shadow-sm"
            title="Platform Admin"
          >
            PA
          </div>
          <div className="hidden lg:block">
            <div className="text-xs font-semibold text-slate-800 leading-tight">Platform Admin</div>
            <div className="text-[10px] text-slate-400 leading-tight">admin@nhpmbr.local</div>
          </div>
        </div>
      </div>
    </header>
  );
}
