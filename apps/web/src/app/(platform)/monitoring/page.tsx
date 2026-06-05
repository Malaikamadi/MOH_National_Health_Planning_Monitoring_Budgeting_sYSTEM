'use client';

import { useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileDown,
  BarChart3,
  Target,
  DollarSign,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';

/* ──── Mock Performance Tracking Data ──── */

interface PerformanceRow {
  activity: string;
  directorate: string;
  unit: string;
  quarter: string;
  planned: string;
  actual: string;
  status: 'completed' | 'on-track' | 'delayed' | 'not-started';
  budgetAllocated: number;
  budgetUsed: number;
  indicator: string;
  responsible: string;
}

const performanceData: PerformanceRow[] = [
  { activity: 'Integrated supportive supervision in 16 districts', directorate: 'DPPI', unit: 'M&E Unit', quarter: 'Q1', planned: '16 districts', actual: '14 districts', status: 'on-track', budgetAllocated: 120000, budgetUsed: 98000, indicator: 'Supervision coverage rate', responsible: 'Dr. A. Koroma' },
  { activity: 'Quarterly performance review meetings', directorate: 'DPPI', unit: 'Planning Unit', quarter: 'Q1', planned: '4 meetings', actual: '4 meetings', status: 'completed', budgetAllocated: 45000, budgetUsed: 42000, indicator: 'Review completion rate', responsible: 'M. Sesay' },
  { activity: 'National immunization outreach campaign', directorate: 'DPHC', unit: 'EPI Unit', quarter: 'Q2', planned: '500K children', actual: '380K children', status: 'on-track', budgetAllocated: 280000, budgetUsed: 195000, indicator: 'DPT3 coverage rate', responsible: 'Dr. M. Kamara' },
  { activity: 'District data quality audit', directorate: 'DPPI', unit: 'M&E Unit', quarter: 'Q2', planned: '8 districts', actual: '3 districts', status: 'delayed', budgetAllocated: 95000, budgetUsed: 34000, indicator: 'Data quality score', responsible: 'A. Conteh' },
  { activity: 'CMAM site nutrition screening', directorate: 'DPHC', unit: 'Nutrition Unit', quarter: 'Q1', planned: '12 sites', actual: '12 sites', status: 'completed', budgetAllocated: 65000, budgetUsed: 58000, indicator: 'Stunting prevalence', responsible: 'S. Mansaray' },
  { activity: 'Maternal mortality review dissemination', directorate: 'DPC', unit: 'Surveillance Unit', quarter: 'Q2', planned: '16 reports', actual: '0 reports', status: 'not-started', budgetAllocated: 78000, budgetUsed: 0, indicator: 'MMR trend', responsible: 'Dr. F. Conteh' },
  { activity: 'TB/HIV integrated testing campaign', directorate: 'DPC', unit: 'Laboratory Unit', quarter: 'Q1', planned: '5,000 tests', actual: '4,800 tests', status: 'completed', budgetAllocated: 110000, budgetUsed: 102000, indicator: 'TB detection rate', responsible: 'Dr. J. Kargbo' },
  { activity: 'Essential medicines procurement cycle', directorate: 'DHS', unit: 'Pharmacy Unit', quarter: 'Q2', planned: '3 procurement rounds', actual: '1 round', status: 'delayed', budgetAllocated: 420000, budgetUsed: 140000, indicator: 'Drug stock-out rate', responsible: 'F. Kamara' },
  { activity: 'Community health worker refresher training', directorate: 'DPHC', unit: 'CHW Programme', quarter: 'Q1', planned: '2,500 CHWs', actual: '2,500 CHWs', status: 'completed', budgetAllocated: 180000, budgetUsed: 175000, indicator: 'CHW competency score', responsible: 'Dr. I. Turay' },
  { activity: 'NHSSP indicator validation workshop', directorate: 'DPPI', unit: 'Planning Unit', quarter: 'Q3', planned: '1 workshop', actual: '—', status: 'not-started', budgetAllocated: 55000, budgetUsed: 0, indicator: 'Indicator validation rate', responsible: 'M. Sesay' },
  { activity: 'ITN mass distribution campaign', directorate: 'DPC', unit: 'Malaria Unit', quarter: 'Q2', planned: '200K nets', actual: '145K nets', status: 'on-track', budgetAllocated: 350000, budgetUsed: 255000, indicator: 'ITN usage rate', responsible: 'M. Bangura' },
  { activity: 'Adolescent health center establishment', directorate: 'DPHC', unit: 'RH Unit', quarter: 'Q2', planned: '8 centers', actual: '3 centers', status: 'delayed', budgetAllocated: 210000, budgetUsed: 72000, indicator: 'Adolescent SRH access', responsible: 'A. Koroma' },
];

function formatLeones(value: number): string {
  if (value >= 1_000_000) return `Le ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Le ${(value / 1_000).toFixed(0)}K`;
  return `Le ${value}`;
}

const statusConfig = {
  completed: { label: 'Completed', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/20', icon: CheckCircle2, color: 'text-emerald-600' },
  'on-track': { label: 'On Track', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/20', icon: TrendingUp, color: 'text-blue-600' },
  delayed: { label: 'Delayed', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/20', icon: AlertTriangle, color: 'text-amber-600' },
  'not-started': { label: 'Not Started', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: Clock, color: 'text-slate-400' },
};

export default function MonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedQuarter, setSelectedQuarter] = useState('All');
  const [selectedDirectorate, setSelectedDirectorate] = useState('All');

  const statuses = ['All', 'completed', 'on-track', 'delayed', 'not-started'];
  const quarters = ['All', 'Q1', 'Q2', 'Q3', 'Q4'];
  const directorates = ['All', ...Array.from(new Set(performanceData.map((d) => d.directorate)))];

  const filteredData = performanceData.filter((row) => {
    const matchSearch =
      row.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'All' || row.status === selectedStatus;
    const matchQuarter = selectedQuarter === 'All' || row.quarter === selectedQuarter;
    const matchDirectorate = selectedDirectorate === 'All' || row.directorate === selectedDirectorate;
    return matchSearch && matchStatus && matchQuarter && matchDirectorate;
  });

  // Summary metrics
  const totalActivities = performanceData.length;
  const completedCount = performanceData.filter((r) => r.status === 'completed').length;
  const onTrackCount = performanceData.filter((r) => r.status === 'on-track').length;
  const delayedCount = performanceData.filter((r) => r.status === 'delayed').length;
  const totalBudgetAllocated = performanceData.reduce((s, r) => s + r.budgetAllocated, 0);
  const totalBudgetUsed = performanceData.reduce((s, r) => s + r.budgetUsed, 0);
  const utilization = totalBudgetAllocated > 0 ? Math.round((totalBudgetUsed / totalBudgetAllocated) * 100) : 0;
  const completionRate = Math.round(((completedCount + onTrackCount) / totalActivities) * 100);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page dark:text-white">Monitoring & Evaluation</h1>
          <p className="text-muted mt-1 dark:text-slate-400">
            Performance Tracking Table (PTT) — Track activity implementation, budget utilization, and outcomes across all directorates.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-outline btn-sm flex items-center gap-1.5">
            <FileDown className="h-3.5 w-3.5" />
            Export PTT
          </button>
        </div>
      </header>

      {/* Summary KPIs */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-5 flex items-center gap-4 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent-50 dark:bg-accent-900/30">
            <Activity className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{totalActivities}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Activities</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{completionRate}%</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">On Track / Completed</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold-50 dark:bg-gold-900/30">
            <DollarSign className="h-5 w-5 text-gold-600 dark:text-gold-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{formatLeones(totalBudgetAllocated)}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Budget ({utilization}% used)</div>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50 dark:bg-amber-900/30">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              <span className="text-emerald-600 dark:text-emerald-400">{completedCount}</span>
              <span className="text-slate-300 dark:text-slate-600 mx-1">/</span>
              <span className="text-blue-600 dark:text-blue-400">{onTrackCount}</span>
              <span className="text-slate-300 dark:text-slate-600 mx-1">/</span>
              <span className="text-amber-600 dark:text-amber-400">{delayedCount}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Done / Track / Delayed</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="card-flat p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-wrap gap-4">
          {/* Status filter */}
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedStatus === s
                    ? 'bg-accent-700 text-white shadow-sm dark:bg-accent-600'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {s === 'All' ? 'All Status' : statusConfig[s as keyof typeof statusConfig]?.label || s}
              </button>
            ))}
          </div>

          {/* Quarter filter */}
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="input py-1.5 text-xs w-28 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          >
            {quarters.map((q) => (
              <option key={q} value={q}>
                {q === 'All' ? 'All Quarters' : q}
              </option>
            ))}
          </select>

          {/* Directorate filter */}
          <select
            value={selectedDirectorate}
            onChange={(e) => setSelectedDirectorate(e.target.value)}
            className="input py-1.5 text-xs w-36 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          >
            {directorates.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Directorates' : d}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search activities, units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-1.5 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      {/* Performance Tracking Table */}
      <div className="card overflow-hidden dark:border-slate-800/80 dark:bg-slate-900">
        <div className="section-header dark:border-slate-800/80">
          <div>
            <h3 className="heading-section dark:text-white">Performance Tracking Table (PTT)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{filteredData.length} activities shown — AWP activities feed directly into this table</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="dark:bg-slate-800/70">
              <tr>
                <th>Activity</th>
                <th>Directorate / Unit</th>
                <th>Quarter</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Status</th>
                <th className="text-right">Budget Allocated</th>
                <th className="text-right">Budget Used</th>
                <th>Indicator</th>
                <th>Responsible</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => {
                const st = statusConfig[row.status];
                const budgetPct = row.budgetAllocated > 0 ? Math.round((row.budgetUsed / row.budgetAllocated) * 100) : 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/40">
                    <td>
                      <div className="font-semibold text-slate-900 text-sm max-w-[260px] dark:text-slate-100">{row.activity}</div>
                    </td>
                    <td>
                      <div className="text-xs">
                        <span className="badge-blue">{row.directorate}</span>
                        <div className="text-slate-500 mt-1 dark:text-slate-400">{row.unit}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-slate font-bold">{row.quarter}</span>
                    </td>
                    <td className="text-sm text-slate-700 tabular-nums dark:text-slate-300">{row.planned}</td>
                    <td className="text-sm font-semibold text-slate-900 tabular-nums dark:text-slate-100">{row.actual}</td>
                    <td>
                      <span className={`status-pill ${st.badge}`}>{st.label}</span>
                    </td>
                    <td className="text-right text-sm font-semibold text-slate-800 tabular-nums dark:text-slate-100">
                      {formatLeones(row.budgetAllocated)}
                    </td>
                    <td className="text-right">
                      <div className="text-sm font-semibold text-slate-800 tabular-nums dark:text-slate-100">
                        {formatLeones(row.budgetUsed)}
                      </div>
                      <div className="flex items-center gap-1.5 justify-end mt-1">
                        <div className="w-12 h-1 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              budgetPct > 80 ? 'bg-amber-500' : 'bg-accent-500'
                            }`}
                            style={{ width: `${budgetPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] tabular-nums text-slate-400 dark:text-slate-500">{budgetPct}%</span>
                      </div>
                    </td>
                    <td className="text-xs text-slate-500 dark:text-slate-400 max-w-[150px]">{row.indicator}</td>
                    <td className="text-sm text-slate-600 dark:text-slate-300">{row.responsible}</td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 dark:text-slate-500">
                    No activities match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PTT Summary by Quarter */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card p-6 dark:border-slate-800/80 dark:bg-slate-900">
          <h3 className="heading-section dark:text-white">Quarterly Performance Summary</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Activities grouped by implementation quarter</p>
          <div className="mt-5 space-y-4">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
              const qData = performanceData.filter((r) => r.quarter === q);
              const qCompleted = qData.filter((r) => r.status === 'completed').length;
              const qTotal = qData.length;
              const qPct = qTotal > 0 ? Math.round((qCompleted / qTotal) * 100) : 0;
              return (
                <div key={q} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-accent-700 dark:text-accent-400 w-10 shrink-0">{q}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>{qCompleted} of {qTotal} completed</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{qPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-500 transition-all duration-700"
                        style={{ width: `${qPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6 dark:border-slate-800/80 dark:bg-slate-900">
          <h3 className="heading-section dark:text-white">Budget Utilization by Directorate</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Budget allocation vs. spend per directorate</p>
          <div className="mt-5 space-y-4">
            {Array.from(new Set(performanceData.map((r) => r.directorate))).map((dir) => {
              const dirData = performanceData.filter((r) => r.directorate === dir);
              const dirAllocated = dirData.reduce((s, r) => s + r.budgetAllocated, 0);
              const dirUsed = dirData.reduce((s, r) => s + r.budgetUsed, 0);
              const dirPct = dirAllocated > 0 ? Math.round((dirUsed / dirAllocated) * 100) : 0;
              return (
                <div key={dir} className="flex items-center gap-4">
                  <span className="badge-blue shrink-0 text-xs">{dir}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>{formatLeones(dirUsed)} / {formatLeones(dirAllocated)}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{dirPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          dirPct > 80 ? 'bg-amber-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${dirPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
