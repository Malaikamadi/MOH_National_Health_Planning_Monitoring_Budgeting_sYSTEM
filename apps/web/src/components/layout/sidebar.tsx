'use client';

import Link from 'next/link';
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

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
    ],
  },
  {
    label: 'Planning',
    items: [
      { href: '/strategy',   label: 'Strategic Plan',   icon: Target },
      { href: '/awps',       label: 'Annual Work Plans', icon: ClipboardCheck },
      { href: '/programmes', label: 'Programmes',       icon: Building2 },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { href: '/indicators', label: 'Indicators',       icon: BarChart3 },
      { href: '/reports',    label: 'Reports',          icon: FileText },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/users',      label: 'User Management',  icon: Users },
      { href: '/audit',      label: 'Audit Log',        icon: ScrollText },
      { href: '/admin',      label: 'Platform Settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out relative',
        collapsed ? 'w-[72px]' : 'w-[272px]',
      )}
      style={{ boxShadow: '2px 0 8px -2px rgba(0,0,0,0.04)' }}
    >
      {/* Logo Header */}
      <div className={cn(
        'flex items-center border-b border-slate-200/80 px-4 py-4 gap-3 min-h-[72px]',
        collapsed && 'justify-center px-2'
      )}>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 shadow-sm ring-2 ring-brand-600/20">
          {/* MOHS Logo placeholder — replace src with /mohs-logo.png if available */}
          <img
            src="/mohs-logo.png"
            alt="MOHS"
            className="h-9 w-9 rounded-full object-cover"
            onError={(e) => {
              // Fallback to text if image not found
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<span class="text-xs font-bold text-white leading-none">MOH</span>';
            }}
          />
        </div>
        {!collapsed && (
          <div className="min-w-0 animate-fade-in">
            <div className="text-sm font-bold leading-tight text-brand-900 truncate">NHPMBR</div>
            <div className="text-[10px] font-medium leading-tight text-slate-400 truncate">
              Ministry of Health & Sanitation
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
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
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-200/60'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0 transition-colors',
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600',
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

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mx-2.5 mb-3 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
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

      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Shield className="h-3 w-3" />
            <span>Government-grade security</span>
          </div>
        </div>
      )}
    </aside>
  );
}
