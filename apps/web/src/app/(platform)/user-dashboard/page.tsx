import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DollarSign,
  ListChecks,
  TrendingUp,
} from 'lucide-react';

export const metadata = { title: 'User Dashboard' };

const myUnit = {
  unit: 'M&E Unit',
  directorate: 'DPPI',
  account: 'me.unit@nhpmbr.gov.sl',
  awpStatus: 'Submitted',
  submittedAt: '2026-04-04',
};

const myActivities = [
  { name: 'Quarterly performance review', quarter: 'Q2', due: 'May 20', status: 'In Progress' },
  { name: 'District data quality audit', quarter: 'Q2', due: 'Jun 02', status: 'Pending' },
  { name: 'NHSSP indicator validation', quarter: 'Q3', due: 'Jul 11', status: 'Planned' },
];

function money(v: number): string {
  if (v >= 1_000_000) return `Le ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `Le ${(v / 1_000).toFixed(0)}K`;
  return `Le ${v}`;
}

export default function UserDashboardPage() {
  const amountNeeded = 360000;
  const amountUsed = 210000;
  const performance = 64;

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="rounded-2xl border border-accent-200/70 bg-gradient-to-r from-accent-50 via-white to-accent-50 p-6 shadow-card dark:border-accent-800/40 dark:from-accent-950/20 dark:via-slate-900 dark:to-accent-950/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-700 dark:text-accent-400">
              User Interface
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              My Unit Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Unit: {myUnit.unit} · Directorate: {myUnit.directorate} · Account: {myUnit.account}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/awps/new" className="btn-primary">
              <ClipboardCheck className="h-4 w-4" />
              Submit AWP
            </Link>
            <Link href="/awps" className="btn-outline">
              <ListChecks className="h-4 w-4" />
              Open AWP Form
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="My AWP status" value={myUnit.awpStatus} note={`Submitted: ${myUnit.submittedAt}`} icon={CheckCircle2} />
        <Metric title="Activities performance" value={`${performance}%`} note="Current quarter performance" icon={TrendingUp} />
        <Metric title="Amount needed" value={money(amountNeeded)} note="Unit total planned budget" icon={DollarSign} />
        <Metric title="Amount used" value={money(amountUsed)} note={`${Math.round((amountUsed / amountNeeded) * 100)}% used`} icon={DollarSign} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="card overflow-hidden xl:col-span-2 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="section-header dark:border-slate-800/80">
            <div>
              <h3 className="heading-section dark:text-slate-100">My upcoming activities by quarter</h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Track scheduled activities and deadlines
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {myActivities.map((a) => (
              <div key={a.name} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {a.quarter} · Due {a.due}
                  </p>
                </div>
                <span className="badge-blue">{a.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="heading-section dark:text-slate-100">Quick actions</h3>
            <div className="mt-4 space-y-3">
              <Link href="/awps/new" className="btn-outline w-full justify-between">
                Submit unit AWP
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/reports" className="btn-outline w-full justify-between">
                View my activity report
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn-ghost w-full justify-between">
                Switch to admin view
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="card p-6 dark:border-slate-800/80 dark:bg-slate-900">
            <h3 className="heading-section dark:text-slate-100">Unit feed status</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock3 className="h-4 w-4 text-amber-600" />
                Submitted data feeds directorate master
              </li>
              <li className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <CalendarClock className="h-4 w-4 text-brand-600" />
                CMO and leadership receive updates
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <article className="kpi-card dark:border-slate-800/80 dark:bg-slate-900">
      <div className="kpi-icon bg-accent-50 dark:bg-accent-900/30">
        <Icon className="h-5 w-5 text-accent-700 dark:text-accent-400" />
      </div>
      <div>
        <p className="kpi-label dark:text-slate-400">{title}</p>
        <p className="kpi-value dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{note}</p>
      </div>
    </article>
  );
}
