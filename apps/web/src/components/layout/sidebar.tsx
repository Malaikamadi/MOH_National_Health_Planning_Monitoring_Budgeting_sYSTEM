'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { MinistryWordmark } from '@/components/brand/ministry-logo';

const navSections = [
  {
    label: 'Overview',
    items: [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Planning',
    items: [
      { href: '/strategy', label: 'Strategic Plan', icon: Target },
      { href: '/awps', label: 'Annual Work Plans', icon: ClipboardCheck },
      { href: '/programmes', label: 'Programmes', icon: Building2 },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { href: '/indicators', label: 'Indicators', icon: BarChart3 },
      { href: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/users', label: 'User Management', icon: Users },
      { href: '/audit', label: 'Audit Log', icon: ScrollText },
      { href: '/admin', label: 'Platform Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out relative dark:border-slate-800/80 dark:bg-slate-900',
        collapsed ? 'w-[80px]' : 'w-[280px]',
      )}
      style={{ boxShadow: '2px 0 12px -4px rgba(15,40,71,0.08)' }}
    >
      <div
        className={cn(
          'flex flex-col border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-white px-4 py-5 gap-3 min-h-[88px] dark:border-slate-800/80 dark:from-slate-900 dark:to-slate-900',
          collapsed && 'items-center px-2',
        )}
      >
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col gap-2')}>
          <div
            className={cn(
              'relative shrink-0 grid place-items-center rounded-full bg-white shadow-md ring-[3px] ring-accent-500/80 ring-offset-2 ring-offset-white dark:bg-slate-800 dark:ring-offset-slate-900',
              collapsed ? 'h-14 w-14' : 'h-[4.5rem] w-[4.5rem]',
            )}
          >
            <Image
              src="/mohs-logo.jpg"
              alt="Ministry of Health — Sierra Leone"
              width={collapsed ? 52 : 68}
              height={collapsed ? 52 : 68}
              className="h-[88%] w-[88%] object-contain"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="text-sm font-bold text-brand-900 dark:text-brand-300 truncate">NHPMBR</p>
              <MinistryWordmark compact className="[&_p:first-child]:text-[11px] [&_p:last-child]:text-[9px] dark:[&_p]:text-slate-300" />
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 dark:text-slate-500">
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-brand-50 text-brand-800 shadow-sm ring-1 ring-brand-200/70 dark:bg-brand-950/40 dark:text-brand-300 dark:ring-brand-800/50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors',
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-400',
                      )}
                    />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mx-2.5 mb-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            <span>Collapse</span>
          </>
        )}
      </button>

      {!collapsed && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
            <Shield className="h-3 w-3 shrink-0 text-accent-600 dark:text-accent-500" />
            <span>Government of Sierra Leone · Secure session</span>
          </div>
        </div>
      )}
    </aside>
  );
}
