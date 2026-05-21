import Link from 'next/link';
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileWarning,
  Layers,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  MapPin,
  Users,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { StatusPill } from '@/components/ui/status-pill';
import type { AwpStatus } from '@/lib/api-client';

export const metadata = { title: 'Dashboard' };

/* ──── Mock Data ──── */

interface DirectorateRow {
  code: string;
  name: string;
  status: AwpStatus;
  submittedAt: string | null;
  activitiesPlanned: number;
  activitiesCompleted: number;
  budgetAllocated: number;
  budgetSpent: number;
}

const directorates: DirectorateRow[] = [
  {
    code: 'DPPI',
    name: 'Directorate of Policy, Planning & Information',
    status: 'approved',
    submittedAt: '2026-03-12',
    activitiesPlanned: 42,
    activitiesCompleted: 18,
    budgetAllocated: 2400000,
    budgetSpent: 890000,
  },
  {
    code: 'DPHC',
    name: 'Directorate of Primary Health Care ',
    status: 'under_review',
    submittedAt: '2026-03-15',
    activitiesPlanned: 86,
    activitiesCompleted: 12,
    budgetAllocated: 5200000,
    budgetSpent: 1450000,
  },
  {
    code: 'DHAS',
    name: 'Directorate of Hospital and Ambulance Services',
    status: 'submitted',
    submittedAt: '2026-03-18',
    activitiesPlanned: 51,
    activitiesCompleted: 8,
    budgetAllocated: 3800000,
    budgetSpent: 620000,
  },
  {
    code: 'RCH',
    name: 'Directorate of Reproductive & Child Health',
    status: 'draft',
    submittedAt: null,
    activitiesPlanned: 0,
    activitiesCompleted: 0,
    budgetAllocated: 0,
    budgetSpent: 0,
  },
  {
    code: 'DPC',
    name: 'Directorate of Disease Prevention & Control',
    status: 'revisions_requested',
    submittedAt: '2026-03-10',
    activitiesPlanned: 64,
    activitiesCompleted: 5,
    budgetAllocated: 4100000,
    budgetSpent: 980000,
  },
  {
    code: 'EPI',
    name: 'Directorate of Epidemiology & Surveillance',
    status: 'approved',
    submittedAt: '2026-03-08',
    activitiesPlanned: 38,
    activitiesCompleted: 22,
    budgetAllocated: 1900000,
    budgetSpent: 1120000,
  },
  {
    code: 'NCD',
    name: 'Directorate of NCD & Mental Health',
    status: 'active',
    submittedAt: '2026-02-28',
    activitiesPlanned: 45,
    activitiesCompleted: 31,
    budgetAllocated: 2800000,
    budgetSpent: 1650000,
  },
  {
    code: 'HR',
    name: 'Directorate of Human Resources for Health',
    status: 'approved',
    submittedAt: '2026-03-05',
    activitiesPlanned: 34,
    activitiesCompleted: 15,
    budgetAllocated: 1600000,
    budgetSpent: 720000,
  },
];

const recentActivity = [
  {
    action: 'AWP approved',
    entity: 'Epidemiology & Surveillance',
    user: 'Dr. Koroma',
    time: '2 hours ago',
    type: 'success' as const,
  },
  {
    action: 'AWP submitted for review',
    entity: 'Maternal & Child Health',
    user: 'M. Sesay',
    time: '5 hours ago',
    type: 'info' as const,
  },
  {
    action: 'Revision requested',
    entity: 'Disease Prevention & Control',
    user: 'Dr. Bangura',
    time: '1 day ago',
    type: 'warning' as const,
  },
  {
    action: 'Budget updated',
    entity: 'Hospital Services',
    user: 'F. Kamara',
    time: '1 day ago',
    type: 'info' as const,
  },
  {
    action: 'New indicator added',
    entity: 'NCD & Mental Health',
    user: 'A. Conteh',
    time: '2 days ago',
    type: 'info' as const,
  },
];

/* ──── Helpers ──── */

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `Le ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Le ${(value / 1_000).toFixed(0)}K`;
  return `Le ${value}`;
}

function progressPercent(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/* ──── Page ──── */

export default function DashboardPage() {
  const totalBudget = directorates.reduce((s, d) => s + d.budgetAllocated, 0);
  const totalSpent = directorates.reduce((s, d) => s + d.budgetSpent, 0);
  const burnRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const totalActivities = directorates.reduce((s, d) => s + d.activitiesPlanned, 0);
  const completedActivities = directorates.reduce((s, d) => s + d.activitiesCompleted, 0);

  return (
    <div className="animate-fade-in space-y-8">
      {/* ── Welcome Header ── */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">
            Welcome back, <span className="text-brand-700">Admin</span>
          </h1>
          <p className="text-muted mt-1">
            Fiscal Year 2026 · Annual Work Plan cycle overview across all directorates
          </p>
        </div>
        <div className="mt-3 flex gap-2 sm:mt-0">
          <Link href="/awps" className="btn-outline btn-sm">
            <Layers className="h-3.5 w-3.5" />
            View AWPs
          </Link>
          <Link href="/reports" className="btn-primary btn-sm">
            <FileCheck2 className="h-3.5 w-3.5" />
            Generate Report
          </Link>
        </div>
      </header>

      {/* ── KPI Cards ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="AWPs Submitted"
          value="7 of 14"
          icon={Layers}
          tone="brand"
          delta="+2 this week"
          deltaDirection="up"
        />
        <KpiCard
          title="Total Budget"
          value={formatCurrency(totalBudget)}
          icon={DollarSign}
          tone="gold"
          delta={`${burnRate}% utilized`}
          deltaDirection={burnRate > 50 ? 'up' : 'down'}
        />
        <KpiCard
          title="Activities Progress"
          value={`${completedActivities} / ${totalActivities}`}
          icon={Activity}
          tone="accent"
          delta={`${progressPercent(completedActivities, totalActivities)}% complete`}
          deltaDirection="up"
        />
        <KpiCard
          title="Revisions Pending"
          value="1"
          icon={AlertTriangle}
          tone="danger"
          delta="Needs attention"
          deltaDirection="down"
        />
      </section>

      {/* ── Two-Column: Budget Overview + Recent Activity ── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Budget Allocation */}
        <div className="card overflow-hidden xl:col-span-2">
          <div className="section-header">
            <div>
              <h3 className="heading-section">Budget Allocation by Directorate</h3>
              <p className="mt-0.5 text-xs text-slate-500">FY 2026 · Top allocations</p>
            </div>
            <Link
              href="/reports"
              className="text-brand-700 hover:text-brand-800 flex items-center gap-1 text-xs font-semibold transition-colors"
            >
              Full breakdown <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-4 p-6">
            {directorates
              .filter((d) => d.budgetAllocated > 0)
              .sort((a, b) => b.budgetAllocated - a.budgetAllocated)
              .slice(0, 6)
              .map((d) => (
                <BudgetBar
                  key={d.code}
                  label={d.name}
                  code={d.code}
                  allocated={d.budgetAllocated}
                  spent={d.budgetSpent}
                  maxBudget={8_400_000}
                />
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <div className="section-header">
            <h3 className="heading-section">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-4 transition-colors hover:bg-slate-50/50">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                      item.type === 'success'
                        ? 'bg-emerald-500'
                        : item.type === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-brand-500'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{item.action}</p>
                    <p className="truncate text-xs text-slate-500">{item.entity}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{item.user}</span>
                      <span>·</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <Link
              href="/audit"
              className="text-brand-700 hover:text-brand-800 flex items-center gap-1 text-xs font-semibold"
            >
              View all activity <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Directorate AWP Table ── */}
      <section className="card overflow-hidden">
        <div className="section-header">
          <div>
            <h3 className="heading-section">Directorate AWP Status — FY 2026</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Click a row to drill into the AWP detail view
            </p>
          </div>
          <Link href="/awps" className="btn-ghost btn-sm">
            Open AWP List
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Directorate</th>
                <th>Status</th>
                <th>Submitted</th>
                <th className="text-right">Activities</th>
                <th className="text-right">Budget</th>
                <th className="text-right">Progress</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {directorates.map((row) => {
                const pct = progressPercent(row.activitiesCompleted, row.activitiesPlanned);
                return (
                  <tr key={row.code}>
                    <td>
                      <div className="font-semibold text-slate-900">{row.name}</div>
                      <div className="mt-0.5 text-xs text-slate-400">{row.code}</div>
                    </td>
                    <td>
                      <StatusPill status={row.status} />
                    </td>
                    <td className="text-sm text-slate-600">
                      {row.submittedAt ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="text-right">
                      <span className="font-medium text-slate-800 tabular-nums">
                        {row.activitiesCompleted}
                      </span>
                      <span className="text-slate-400"> / {row.activitiesPlanned}</span>
                    </td>
                    <td className="text-right">
                      {row.budgetAllocated > 0 ? (
                        <span className="font-medium text-slate-800 tabular-nums">
                          {formatCurrency(row.budgetAllocated)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="bg-brand-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-medium text-slate-600 tabular-nums">
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/awps?directorate=${row.code}`}
                        className="text-brand-700 hover:text-brand-800 text-xs font-semibold transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Quick Stats Footer ── */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat icon={MapPin} label="Districts Reporting" value="14 / 16" />
        <MiniStat icon={Users} label="Active Users" value="89" />
        <MiniStat icon={Calendar} label="Days to Deadline" value="42" />
        <MiniStat icon={CheckCircle2} label="Indicators Tracked" value="156" />
      </section>
    </div>
  );
}

/* ──── Sub-components ──── */

function KpiCard({
  title,
  value,
  icon: Icon,
  tone,
  delta,
  deltaDirection,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'brand' | 'accent' | 'gold' | 'danger';
  delta: string;
  deltaDirection: 'up' | 'down';
}) {
  const toneMap = {
    brand: { bg: 'bg-brand-50', text: 'text-brand-700', icon: 'text-brand-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-700', icon: 'text-accent-600' },
    gold: { bg: 'bg-gold-50', text: 'text-gold-700', icon: 'text-gold-600' },
    danger: { bg: 'bg-danger-50', text: 'text-danger-700', icon: 'text-danger-600' },
  };
  const t = toneMap[tone];

  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${t.bg}`}>
        <Icon className={`h-6 w-6 ${t.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="kpi-label">{title}</div>
        <div className="kpi-value">{value}</div>
        <div className={`mt-1 ${deltaDirection === 'up' ? 'kpi-delta-up' : 'kpi-delta-down'}`}>
          {deltaDirection === 'up' ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta}
        </div>
      </div>
    </div>
  );
}

function BudgetBar({
  label,
  code,
  allocated,
  spent,
  maxBudget,
}: {
  label: string;
  code: string;
  allocated: number;
  spent: number;
  maxBudget: number;
}) {
  const pct = Math.round((allocated / maxBudget) * 100);
  const spentPct = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-brand-700 bg-brand-50 rounded px-1.5 py-0.5 text-xs font-bold">
            {code}
          </span>
          <span className="truncate text-sm font-medium text-slate-700">{label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-800 tabular-nums">
            {formatCurrency(allocated)}
          </span>
          <span className="text-slate-400 tabular-nums">{spentPct}% used</span>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="from-brand-500 to-brand-400 relative h-full rounded-full bg-gradient-to-r transition-all duration-700"
          style={{ width: `${pct}%` }}
        >
          <div
            className="bg-brand-700/30 absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="card-flat flex items-center gap-3 p-4">
      <Icon className="h-5 w-5 shrink-0 text-slate-400" />
      <div>
        <div className="text-lg font-bold text-slate-800 tabular-nums">{value}</div>
        <div className="text-[11px] text-slate-500">{label}</div>
      </div>
    </div>
  );
}
