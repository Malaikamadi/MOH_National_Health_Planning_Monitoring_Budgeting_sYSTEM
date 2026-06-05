'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  Layers,
  ListChecks,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

/* ──── Mock data by directorate ──── */

interface UnitData {
  unitName: string;
  email: string;
  awpStatus: 'submitted' | 'draft' | 'under_review' | 'approved' | 'not_started';
  awpSubmittedAt: string | null;
  activitiesPerformance: number;
  amountNeeded: number;
  amountUsed: number;
  lastLogin: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

const unitsByDirectorate: Record<string, UnitData[]> = {
  DPPI: [
    { unitName: 'M&E Unit', email: 'me.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-04', activitiesPerformance: 64, amountNeeded: 360000, amountUsed: 210000, lastLogin: '2 hours ago', status: 'Active' },
    { unitName: 'Planning Unit', email: 'planning.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-03', activitiesPerformance: 58, amountNeeded: 410000, amountUsed: 226000, lastLogin: '5 hours ago', status: 'Active' },
    { unitName: 'HMIS Unit', email: 'hmis.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-28', activitiesPerformance: 72, amountNeeded: 290000, amountUsed: 198000, lastLogin: '1 day ago', status: 'Active' },
  ],
  DPHC: [
    { unitName: 'EPI Unit', email: 'epi.unit@mohs.gov.sl', awpStatus: 'under_review', awpSubmittedAt: '2026-04-06', activitiesPerformance: 49, amountNeeded: 520000, amountUsed: 231000, lastLogin: '6 hours ago', status: 'Active' },
    { unitName: 'Nutrition Unit', email: 'nutrition.unit@mohs.gov.sl', awpStatus: 'draft', awpSubmittedAt: null, activitiesPerformance: 30, amountNeeded: 250000, amountUsed: 90000, lastLogin: '2 days ago', status: 'Active' },
    { unitName: 'CHW Programme', email: 'chw.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-02', activitiesPerformance: 68, amountNeeded: 480000, amountUsed: 312000, lastLogin: '4 hours ago', status: 'Active' },
    { unitName: 'RH Unit', email: 'rh.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-30', activitiesPerformance: 55, amountNeeded: 395000, amountUsed: 190000, lastLogin: '1 day ago', status: 'Active' },
  ],
  DPC: [
    { unitName: 'Surveillance Unit', email: 'surveillance.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-01', activitiesPerformance: 71, amountNeeded: 470000, amountUsed: 320000, lastLogin: '1 hour ago', status: 'Active' },
    { unitName: 'Laboratory Unit', email: 'lab.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-05', activitiesPerformance: 61, amountNeeded: 300000, amountUsed: 160000, lastLogin: '3 hours ago', status: 'Active' },
    { unitName: 'Malaria Unit', email: 'malaria.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-25', activitiesPerformance: 76, amountNeeded: 550000, amountUsed: 398000, lastLogin: '5 hours ago', status: 'Active' },
  ],
  DHS: [
    { unitName: 'Pharmacy Unit', email: 'pharmacy.unit@mohs.gov.sl', awpStatus: 'under_review', awpSubmittedAt: '2026-04-08', activitiesPerformance: 42, amountNeeded: 620000, amountUsed: 240000, lastLogin: '6 hours ago', status: 'Active' },
    { unitName: 'NCD Unit', email: 'ncd.unit@mohs.gov.sl', awpStatus: 'not_started', awpSubmittedAt: null, activitiesPerformance: 0, amountNeeded: 180000, amountUsed: 0, lastLogin: 'Never', status: 'Pending' },
    { unitName: 'Mental Health Unit', email: 'mentalhealth.unit@mohs.gov.sl', awpStatus: 'draft', awpSubmittedAt: null, activitiesPerformance: 15, amountNeeded: 120000, amountUsed: 18000, lastLogin: '1 week ago', status: 'Inactive' },
  ],
  DHRH: [
    { unitName: 'Training Unit', email: 'training.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-07', activitiesPerformance: 53, amountNeeded: 340000, amountUsed: 172000, lastLogin: '8 hours ago', status: 'Active' },
    { unitName: 'Deployment & Staffing', email: 'deployment.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-22', activitiesPerformance: 67, amountNeeded: 280000, amountUsed: 185000, lastLogin: '3 hours ago', status: 'Active' },
  ],
};

const awpStatusConfig: Record<string, { label: string; badge: string }> = {
  submitted: { label: 'Submitted', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/20' },
  draft: { label: 'Draft', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  under_review: { label: 'Under Review', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/20' },
  approved: { label: 'Approved', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/20' },
  not_started: { label: 'Not Started', badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/20' },
};

const defaultStatusCfg = { label: 'Draft', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };

function formatLeones(value: number): string {
  if (value >= 1_000_000) return `Le ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Le ${(value / 1_000).toFixed(0)}K`;
  return `Le ${value}`;
}

/* ──── Page ──── */

export default function DirectorDashboardPage() {
  const { user } = useAuth();

  const code = user?.directorateCode ?? 'DPPI';
  const dirName = user?.directorate ?? 'Directorate of Policy, Planning & Information';
  const directorName = user?.name ?? 'Director';

  const units = unitsByDirectorate[code] ?? unitsByDirectorate['DPPI']!;
  const totalUnits = units.length;
  const submitted = units.filter((u) => u.awpStatus === 'submitted' || u.awpStatus === 'approved').length;
  const totalNeeded = units.reduce((s, u) => s + u.amountNeeded, 0);
  const totalUsed = units.reduce((s, u) => s + u.amountUsed, 0);
  const avgPerformance = totalUnits > 0 ? Math.round(units.reduce((s, u) => s + u.activitiesPerformance, 0) / totalUnits) : 0;
  const utilization = totalNeeded > 0 ? Math.round((totalUsed / totalNeeded) * 100) : 0;
  const activeUnits = units.filter((u) => u.status === 'Active').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <section className="rounded-2xl border border-accent-200/70 bg-gradient-to-r from-accent-50 via-white to-accent-50 p-6 shadow-card dark:border-accent-800/40 dark:from-accent-950/30 dark:via-slate-900 dark:to-accent-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent-600 to-accent-800 shadow-lg">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-blue font-bold text-xs">{code}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-accent-700 ring-1 ring-accent-600/20 dark:bg-accent-950/40 dark:text-accent-300 dark:ring-accent-500/20">
                  <Shield className="h-3 w-3" /> Director View
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {dirName}
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Signed in as <span className="font-semibold">{directorName}</span> — overseeing {totalUnits} units within this directorate.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/awps" className="btn-primary">
              <ClipboardCheck className="h-4 w-4" /> Review Unit AWPs
            </Link>
            <Link href="/reports" className="btn-outline">
              <ListChecks className="h-4 w-4" /> Directorate Report
            </Link>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Users} title="Units in directorate" value={`${totalUnits}`} note={`${activeUnits} active`} />
        <KpiCard icon={CheckCircle2} title="AWPs submitted / approved" value={`${submitted} / ${totalUnits}`} note="Completion rate" />
        <KpiCard icon={BarChart3} title="Avg. performance" value={`${avgPerformance}%`} note="Across all units" />
        <KpiCard icon={DollarSign} title="Budget utilization" value={`${utilization}%`} note={`${formatLeones(totalUsed)} of ${formatLeones(totalNeeded)}`} />
      </section>

      {/* Unit table */}
      <section className="card overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
        <div className="section-header dark:border-slate-800/80">
          <div>
            <h3 className="heading-section dark:text-slate-100">Units within {code}</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              AWP submissions, performance, and budget status for each unit
            </p>
          </div>
          <Link href="/awps" className="btn-ghost btn-sm">
            View all AWPs <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="dark:bg-slate-800/70">
              <tr>
                <th>Unit</th>
                <th>AWP Status</th>
                <th>Submitted</th>
                <th className="text-right">Performance</th>
                <th className="text-right">Amount Needed</th>
                <th className="text-right">Amount Used</th>
                <th>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => {
                const utilPct = unit.amountNeeded > 0 ? Math.round((unit.amountUsed / unit.amountNeeded) * 100) : 0;
                const statusCfg = awpStatusConfig[unit.awpStatus] ?? defaultStatusCfg;
                return (
                  <tr key={unit.email} className="dark:border-slate-800/60 dark:hover:bg-slate-800/50">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-600 to-accent-800 text-xs font-bold text-white shadow-sm">
                          {unit.unitName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{unit.unitName}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{unit.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${statusCfg.badge}`}>{statusCfg.label}</span>
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-300 tabular-nums">
                      {unit.awpSubmittedAt ?? <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              unit.activitiesPerformance >= 60 ? 'bg-emerald-500' :
                              unit.activitiesPerformance >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${unit.activitiesPerformance}%` }}
                          />
                        </div>
                        <span className="font-semibold tabular-nums text-sm text-slate-800 dark:text-slate-100">{unit.activitiesPerformance}%</span>
                      </div>
                    </td>
                    <td className="text-right font-semibold tabular-nums text-sm text-slate-800 dark:text-slate-100">
                      {formatLeones(unit.amountNeeded)}
                    </td>
                    <td className="text-right">
                      <div className="font-semibold tabular-nums text-sm text-slate-800 dark:text-slate-100">
                        {formatLeones(unit.amountUsed)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{utilPct}% used</div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        unit.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' :
                        unit.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' :
                        'text-slate-400 dark:text-slate-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          unit.status === 'Active' ? 'bg-emerald-500 animate-pulse-slow' :
                          unit.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`} />
                        {unit.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-800/50 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Total Budget: <span className="font-bold text-slate-800 dark:text-slate-100">{formatLeones(totalNeeded)}</span>
          </span>
          <span>
            Used: <span className="font-bold text-slate-800 dark:text-slate-100">{formatLeones(totalUsed)}</span>
            <span className="ml-1">({utilization}%)</span>
          </span>
          <span>
            Avg Performance: <span className="font-bold text-slate-800 dark:text-slate-100">{avgPerformance}%</span>
          </span>
        </div>
      </section>

      {/* Data Feed & Quick Actions */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-50 dark:bg-accent-900/30">
              <Layers className="h-6 w-6 text-accent-600 dark:text-accent-400" />
            </div>
            <div>
              <h3 className="heading-section dark:text-white">Data Feed Hierarchy</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Each unit submits its AWP independently. Unit data feeds into your <span className="font-semibold">{code} directorate master</span>, then aggregates to the <span className="font-semibold">CMO</span> and <span className="font-semibold">Leadership</span> level for national planning decisions.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs flex-wrap">
                <span className="badge-blue">Unit Account</span>
                <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                <span className="badge-green">{code} Director (You)</span>
                <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                <span className="badge-amber">CMO Office</span>
                <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                <span className="bg-accent-50 text-accent-700 ring-1 ring-accent-600/10 dark:bg-accent-950/40 dark:text-accent-300 dark:ring-accent-500/20 badge">Leadership</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 dark:border-slate-800/80 dark:bg-slate-900">
          <h3 className="heading-section dark:text-slate-100">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <Link href="/awps" className="btn-outline w-full justify-between">
              Review unit AWPs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/monitoring" className="btn-outline w-full justify-between">
              M&E / Performance
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/reports" className="btn-outline w-full justify-between">
              Directorate reports
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FooterStat icon={Users} label="Unit accounts" value={`${activeUnits} active`} />
        <FooterStat icon={TrendingUp} label="Avg. performance" value={`${avgPerformance}%`} />
        <FooterStat icon={CalendarClock} label="Quarter in focus" value="Q2 2026" />
        <FooterStat icon={Layers} label="Data feed" value={`${code} → CMO`} />
      </section>
    </div>
  );
}

/* ──── Sub-components ──── */

function KpiCard({ icon: Icon, title, value, note }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string; note: string }) {
  return (
    <article className="kpi-card dark:border-slate-800/80 dark:bg-slate-900">
      <div className="kpi-icon bg-accent-50 dark:bg-accent-900/30"><Icon className="h-5 w-5 text-accent-700 dark:text-accent-400" /></div>
      <div>
        <p className="kpi-label dark:text-slate-400">{title}</p>
        <p className="kpi-value dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>
      </div>
    </article>
  );
}

function FooterStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="card-flat flex items-center gap-3 p-4 dark:border-slate-800/80 dark:bg-slate-900">
      <Icon className="h-5 w-5 shrink-0 text-accent-700 dark:text-accent-300" />
      <div>
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}
