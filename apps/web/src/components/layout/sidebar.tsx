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
  UserCircle2,
  ScrollText,
  Settings,
  Shield,
  Target,
  Users,
  ChevronLeft,
  ChevronRight,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { MinistryWordmark } from '@/components/brand/ministry-logo';
import { useAuth } from '@/lib/auth-context';

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdminView =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/admin');

  const currentNavSections = useMemo(() => {
    const portalPlanningItems = [
      { href: '/strategy', label: 'Strategic Plan', icon: Target },
      { href: '/awps', label: 'Annual Work Plans', icon: ClipboardCheck },
      { href: '/programmes', label: 'Programmes', icon: Building2 },
    ];
    
    const portalMonitoringItems = [
      { href: '/monitoring', label: 'M&E / PTT', icon: Activity },
      { href: '/reports', label: 'Reports', icon: FileText },
    ];

    if (user?.role === 'super_admin') {
      if (isAdminView) {
        return [
          {
            label: 'Overview',
            items: [{ href: '/dashboard', label: 'Consolidated Dashboard', icon: LayoutDashboard }],
          },
          {
            label: 'Security & Access',
            items: [
              { href: '/users', label: 'User Management', icon: Users },
              { href: '/audit', label: 'Audit Log', icon: ScrollText },
            ],
          },
          {
            label: 'Configuration',
            items: [{ href: '/admin', label: 'Platform Settings', icon: Settings }],
          },
        ];
      } else {
        return [
          {
            label: 'Overview',
            items: [{ href: '/user-dashboard', label: 'My Unit Dashboard', icon: UserCircle2 }],
          },
          { label: 'Planning', items: portalPlanningItems },
          { label: 'Monitoring', items: portalMonitoringItems },
        ];
      }
    }

    if (user?.role === 'admin') {
      return [
        {
          label: 'Overview',
          items: [{ href: '/director-dashboard', label: 'Directorate Dashboard', icon: Building2 }],
        },
        { label: 'Planning', items: portalPlanningItems },
        { label: 'Monitoring', items: portalMonitoringItems },
      ];
    }

    // default (user)
    return [
      {
        label: 'Overview',
        items: [{ href: '/user-dashboard', label: 'My Unit Dashboard', icon: UserCircle2 }],
      },
      { label: 'Planning', items: portalPlanningItems },
      { label: 'Monitoring', items: portalMonitoringItems },
    ];
  }, [user, isAdminView]);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out relative border-r',
        isAdminView
          ? 'bg-slate-950 border-slate-900 text-slate-350 shadow-2xl'
          : 'bg-white border-slate-200/80 text-slate-700 dark:border-slate-800/80 dark:bg-slate-900',
        collapsed ? 'w-[80px]' : 'w-[280px]',
      )}
      style={{
        boxShadow: isAdminView
          ? '4px 0 24px -4px rgba(0,0,0,0.4)'
          : '2px 0 12px -4px rgba(15,40,71,0.08)',
      }}
    >
      <div
        className={cn(
          'flex flex-col border-b px-4 py-5 gap-3 min-h-[88px]',
          isAdminView
            ? 'border-slate-900 bg-gradient-to-b from-slate-900 to-slate-950'
            : 'border-slate-200/80 bg-gradient-to-b from-accent-50/40 to-white dark:border-slate-800/80 dark:from-accent-950/20 dark:to-slate-900',
          collapsed && 'items-center px-2',
        )}
      >
        <div className={cn('flex items-center gap-3', collapsed && 'flex-col gap-2')}>
          <div
            className={cn(
              'relative shrink-0 grid place-items-center rounded-full shadow-md ring-[3px] ring-offset-2',
              isAdminView
                ? 'bg-slate-900 ring-amber-500/80 ring-offset-slate-950'
                : 'bg-white ring-accent-600/90 ring-offset-white dark:bg-slate-800 dark:ring-accent-500/80 dark:ring-offset-slate-900',
              collapsed ? 'h-14 w-14' : 'h-[4.5rem] w-[4.5rem]',
            )}
          >
            <Image
              src="/mohs-logo.jpg"
              alt="Ministry of Health — Sierra Leone"
              width={collapsed ? 52 : 68}
              height={collapsed ? 52 : 68}
              className="h-[88%] w-[88%] object-contain rounded-full"
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p
                className={cn(
                  'text-sm font-bold truncate',
                  isAdminView ? 'text-amber-400' : 'text-accent-800 dark:text-accent-400',
                )}
              >
                NHPMBR
              </p>
              <MinistryWordmark
                compact
                className={cn(
                  '[&_p:first-child]:text-[11px] [&_p:last-child]:text-[9px]',
                  isAdminView ? '[&_p]:text-slate-400' : 'dark:[&_p]:text-slate-300',
                )}
              />
              {isAdminView && (
                <span className="inline-block mt-1 bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  Admin Console
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {currentNavSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div
                className={cn(
                  'mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.08em]',
                  isAdminView ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500',
                )}
              >
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
                        ? isAdminView
                          ? 'bg-amber-500/10 text-amber-400 shadow-sm ring-1 ring-amber-500/30'
                          : 'bg-accent-50 text-accent-800 shadow-sm ring-1 ring-accent-200/70 dark:bg-accent-950/40 dark:text-accent-300 dark:ring-accent-800/50'
                        : isAdminView
                          ? 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors',
                        isActive
                          ? isAdminView
                            ? 'text-amber-500'
                            : 'text-accent-600 dark:text-accent-400'
                          : isAdminView
                            ? 'text-slate-500 group-hover:text-slate-350'
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

      {/* Switcher Block — ONLY for super_admin */}
      {user?.role === 'super_admin' && (
        <>
          {!collapsed && (
            <div
              className={cn(
                'px-4 py-3 border-t',
                isAdminView ? 'border-slate-900' : 'border-slate-100 dark:border-slate-800',
              )}
            >
              {isAdminView ? (
                <Link
                  href="/user-dashboard"
                  className="group flex items-center justify-between rounded-xl bg-slate-900/50 hover:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-300 transition-all border border-slate-900 hover:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 rotate-180 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:-translate-x-0.5" />
                    <span>Exit to Portal</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-600" />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="group flex items-center justify-between rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-800 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-all dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-accent-950/20 dark:hover:text-accent-300"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400 group-hover:text-brand-600 dark:text-slate-500 dark:group-hover:text-accent-400" />
                    <span>Admin Console</span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-450 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          )}

          {collapsed && (
            <div
              className={cn(
                'py-2 border-t flex justify-center',
                isAdminView ? 'border-slate-900' : 'border-slate-100 dark:border-slate-800',
              )}
            >
              {isAdminView ? (
                <Link
                  href="/user-dashboard"
                  title="Exit to Portal"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900/50 hover:bg-slate-900 transition-all border border-slate-900"
                >
                  <ArrowRight className="h-4.5 w-4.5 rotate-180 text-slate-400" />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  title="Admin Console"
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-800 transition-all dark:bg-slate-800/40 dark:text-slate-300"
                >
                  <Shield className="h-4.5 w-4.5 text-slate-400 hover:text-brand-600" />
                </Link>
              )}
            </div>
          )}
        </>
      )}

      <button
        onClick={() => setCollapsed((c) => !c)}
        className={cn(
          'mx-2.5 mb-3 flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
          isAdminView
            ? 'border-slate-900 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        )}
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
        <div
          className={cn(
            'border-t px-4 py-3',
            isAdminView ? 'border-slate-900' : 'border-slate-100 dark:border-slate-800',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-2 text-[10px]',
              isAdminView ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500',
            )}
          >
            <Shield
              className={cn(
                'h-3 w-3 shrink-0',
                isAdminView ? 'text-amber-500' : 'text-accent-600 dark:text-accent-500',
              )}
            />
            <span>Government of Sierra Leone · Secure session</span>
          </div>
        </div>
      )}
    </aside>
  );
}
