import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  DollarSign,
  FolderKanban,
  Layers,
  Target,
  TrendingUp,
  Users2,
} from 'lucide-react';

export const metadata = { title: 'Dashboard' };

type UnitAwp = {
  unit: string;
  directorate: string;
  status: 'submitted' | 'draft' | 'under_review';
  submittedAt: string | null;
  activitiesPerformance: number;
  amountNeeded: number;
  amountUsed: number;
};

const unitAwps: UnitAwp[] = [
  { unit: 'M&E Unit', directorate: 'DPPI', status: 'submitted', submittedAt: '2026-04-04', activitiesPerformance: 64, amountNeeded: 360000, amountUsed: 210000 },
  { unit: 'Planning Unit', directorate: 'DPPI', status: 'submitted', submittedAt: '2026-04-03', activitiesPerformance: 58, amountNeeded: 410000, amountUsed: 226000 },
  { unit: 'EPI Unit', directorate: 'DPHC', status: 'under_review', submittedAt: '2026-04-06', activitiesPerformance: 49, amountNeeded: 520000, amountUsed: 231000 },
  { unit: 'Nutrition Unit', directorate: 'DPHC', status: 'draft', submittedAt: null, activitiesPerformance: 30, amountNeeded: 250000, amountUsed: 90000 },
  { unit: 'Surveillance Unit', directorate: 'DPC', status: 'submitted', submittedAt: '2026-04-01', activitiesPerformance: 71, amountNeeded: 470000, amountUsed: 320000 },
  { unit: 'Laboratory Unit', directorate: 'DPC', status: 'submitted', submittedAt: '2026-04-05', activitiesPerformance: 61, amountNeeded: 300000, amountUsed: 160000 },
];

const quarterlyActivities = [
  { quarter: 'Q2 2026', item: 'Integrated supportive supervision in 16 districts', due: 'May 20' },
  { quarter: 'Q2 2026', item: 'Maternal mortality review dissemination', due: 'Jun 03' },
  { quarter: 'Q3 2026', item: 'National immunization outreach campaign', due: 'Jul 15' },
  { quarter: 'Q3 2026', item: 'Data quality audit across referral hospitals', due: 'Aug 02' },
];

const programmeLeads = [
  { programme: 'RMNCAH', lead: 'Dr. Z. Koroma' },
  { programme: 'EPI', lead: 'Dr. K. Bangura' },
  { programme: 'TB/Leprosy', lead: 'Dr. M. Sesay' },
  { programme: 'HIV/AIDS', lead: 'Dr. F. Kamara' },
];

function formatLeones(value: number): string {
  if (value >= 1_000_000) return `Le ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Le ${(value / 1_000).toFixed(0)}K`;
  return `Le ${value}`;
}

function statusClass(status: UnitAwp['status']): string {
  if (status === 'submitted') return 'badge-green';
  if (status === 'under_review') return 'badge-amber';
  return 'badge-slate';
}

export default function DashboardPage() {
  const totalUnits = unitAwps.length;
  const submitted = unitAwps.filter((u) => u.status === 'submitted').length;
  const totalNeeded = unitAwps.reduce((sum, u) => sum + u.amountNeeded, 0);
  const totalUsed = unitAwps.reduce((sum, u) => sum + u.amountUsed, 0);
  const avgPerformance = Math.round(unitAwps.reduce((sum, u) => sum + u.activitiesPerformance, 0) / unitAwps.length);
  const uniqueDirectorates = new Set(unitAwps.map((u) => u.directorate)).size;
  const utilization = totalNeeded > 0 ? Math.round((totalUsed / totalNeeded) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="rounded-2xl border border-accent-200/70 bg-gradient-to-r from-accent-50 via-white to-accent-50 p-6 shadow-card dark:border-accent-800/40 dark:from-accent-950/30 dark:via-slate-900 dark:to-accent-950/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-700 dark:text-accent-400">User Perspective Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Annual Work Plan Submission</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Each unit submits its own AWP using the standard template. Submissions feed to the directorate, CMO, and leadership master view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/awps/new" className="btn-primary"><ClipboardCheck className="h-4 w-4" />Submit AWP</Link>
            <Link href="/awps" className="btn-outline"><Layers className="h-4 w-4" />Use AWP template</Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={CheckCircle2} title="Plans submitted" value={`${submitted} / ${totalUnits}`} note="Units completed" />
        <KpiCard icon={BarChart3} title="Activities performance" value={`${avgPerformance}%`} note="Average across units" />
        <KpiCard icon={DollarSign} title="Amount needed" value={formatLeones(totalNeeded)} note="FY 2026 consolidated" />
        <KpiCard icon={TrendingUp} title="Amount used" value={formatLeones(totalUsed)} note={`${utilization}% utilization`} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="section-header dark:border-slate-800/80">
            <div>
              <h3 className="heading-section dark:text-slate-100">Units and directorates submissions</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">View number of plans submitted per unit and directorate</p>
            </div>
            <Link href="/awps" className="btn-ghost btn-sm">View all AWPs<ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead className="dark:bg-slate-800/70">
                <tr>
                  <th>Unit</th>
                  <th>Directorate</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th className="text-right">Performance</th>
                  <th className="text-right">Amount Needed</th>
                  <th className="text-right">Amount Used</th>
                </tr>
              </thead>
              <tbody>
                {unitAwps.map((row) => (
                  <tr key={`${row.directorate}-${row.unit}`} className="dark:border-slate-800/60 dark:hover:bg-slate-800/50">
                    <td className="font-medium text-slate-800 dark:text-slate-100">{row.unit}</td>
                    <td><span className="badge-blue">{row.directorate}</span></td>
                    <td><span className={`badge ${statusClass(row.status)}`}>{row.status.replace('_', ' ')}</span></td>
                    <td className="text-sm text-slate-600 dark:text-slate-300">{row.submittedAt ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className="text-right font-semibold tabular-nums text-slate-800 dark:text-slate-100">{row.activitiesPerformance}%</td>
                    <td className="text-right font-semibold tabular-nums text-slate-800 dark:text-slate-100">{formatLeones(row.amountNeeded)}</td>
                    <td className="text-right font-semibold tabular-nums text-slate-800 dark:text-slate-100">{formatLeones(row.amountUsed)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
            <div className="section-header dark:border-slate-800/80"><h3 className="heading-section dark:text-slate-100">Upcoming activities by quarter</h3></div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {quarterlyActivities.map((item) => (
                <div key={item.item} className="px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-accent-700 dark:text-accent-400">{item.quarter}</p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">{item.item}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Due: {item.due}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
            <div className="section-header dark:border-slate-800/80"><h3 className="heading-section dark:text-slate-100">Programmes</h3></div>
            <div className="px-5 py-4">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{programmeLeads.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Number of programmes</p>
              <div className="mt-4 space-y-2">
                {programmeLeads.map((p) => (
                  <div key={p.programme} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{p.programme}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Lead: {p.lead}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">Strategic plan</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">NHSSP: National Health Sector Strategic Plan 2026–2030</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Strategic outcomes and NHSSP indicators are anchored here and appear under each directorate plan over time.</p>
            </div>
            <Target className="h-7 w-7 shrink-0 text-brand-700 dark:text-brand-300" />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StrategicMini label="Directorates aligned" value={`${uniqueDirectorates}`} />
            <StrategicMini label="NHSSP indicators" value="142" />
            <StrategicMini label="Strategic period" value="2026–2030" />
          </div>
        </div>

        <div className="card p-6 dark:border-slate-800/80 dark:bg-slate-900">
          <h3 className="heading-section dark:text-slate-100">Recently activities</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">View units with directorate activities</p>
          <div className="mt-4 space-y-3">
            <RecentItem title="M&E Unit submitted AWP" subtitle="DPPI · 2 hours ago" />
            <RecentItem title="EPI Unit submitted under review" subtitle="DPHC · today" />
            <RecentItem title="Laboratory performance updated" subtitle="DPC · yesterday" />
          </div>
          <Link href="/reports" className="btn-ghost btn-sm mt-4">Open activity report<ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FooterStat icon={Users2} label="Unit accounts" value="48 active" />
        <FooterStat icon={FolderKanban} label="Directorate plans" value="14 tracked" />
        <FooterStat icon={CalendarClock} label="Quarter in focus" value="Q2 2026" />
        <FooterStat icon={Layers} label="Master feed" value="CMO + Leadership" />
      </section>
    </div>
  );
}

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

function StrategicMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800/70 dark:bg-slate-800/60">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function RecentItem({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-lg border border-slate-200/80 px-3 py-2 dark:border-slate-800/70">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{title}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}

function FooterStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="card-flat flex items-center gap-3 p-4 dark:border-slate-800/80 dark:bg-slate-900">
      <Icon className="h-5 w-5 shrink-0 text-brand-700 dark:text-brand-300" />
      <div>
        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      </div>
    </div>
  );
}
