'use client';

import { useState } from 'react';
import {
  ScrollText,
  Filter,
  Search,
  Calendar,
  Download,
  ChevronDown,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Clock,
  User,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';

/* ──── Mock Data ──── */

interface AuditEntry {
  id: string;
  action: string;
  resource: string;
  user: string;
  role: string;
  timestamp: string;
  ip: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  details?: string;
}

const auditEntries: AuditEntry[] = [
  { id: 'a1', action: 'AWP approved', resource: 'awp/epi-2026', user: 'Dr. A. Koroma', role: 'Director', timestamp: '2026-05-19 14:32', ip: '196.49.x.x', severity: 'success', details: 'Approved after second review cycle. Budget verified by finance team.' },
  { id: 'a2', action: 'User role updated', resource: 'user/m.sesay', user: 'Platform Admin', role: 'Super Admin', timestamp: '2026-05-19 12:15', ip: '196.49.x.x', severity: 'warning', details: 'Role changed from Viewer to Planner. Approved by Director DPPI.' },
  { id: 'a3', action: 'AWP submitted for review', resource: 'awp/mch-2026', user: 'M. Sesay', role: 'Planner', timestamp: '2026-05-19 11:48', ip: '196.49.x.x', severity: 'info', details: '72 activities planned, budget of Le 6.1M allocated across 4 quarters.' },
  { id: 'a4', action: 'Budget line modified', resource: 'awp/dhs-2026/budget', user: 'F. Kamara', role: 'Finance', timestamp: '2026-05-18 16:22', ip: '196.49.x.x', severity: 'info', details: 'Q2 budget adjusted from Le 1.2M to Le 1.4M for equipment procurement.' },
  { id: 'a5', action: 'Revision requested', resource: 'awp/ddc-2026', user: 'Dr. F. Bangura', role: 'Director', timestamp: '2026-05-18 15:05', ip: '196.49.x.x', severity: 'warning', details: 'Requested revision on 3 activities. Indicator targets need alignment with strategic plan.' },
  { id: 'a6', action: 'Failed login attempt', resource: 'auth/login', user: 'unknown@test.com', role: '—', timestamp: '2026-05-18 13:41', ip: '41.76.x.x', severity: 'error', details: 'Failed authentication attempt from unrecognized IP. Account locked after 5 attempts.' },
  { id: 'a7', action: 'Indicator value updated', resource: 'indicator/dpt3-coverage', user: 'A. Conteh', role: 'M&E Officer', timestamp: '2026-05-18 10:30', ip: '196.49.x.x', severity: 'info', details: 'DPT3 coverage updated from 85% to 89% based on Q1 district reports.' },
  { id: 'a8', action: 'Report generated', resource: 'report/q1-2026', user: 'Dr. A. Koroma', role: 'Director', timestamp: '2026-05-17 09:15', ip: '196.49.x.x', severity: 'success', details: 'Q1 Performance Report auto-generated. 38 pages, exported as PDF.' },
  { id: 'a9', action: 'New user created', resource: 'user/s.mansaray', user: 'Platform Admin', role: 'Super Admin', timestamp: '2026-05-16 14:50', ip: '196.49.x.x', severity: 'info', details: 'User S. Mansaray created with Viewer role in RCH directorate.' },
  { id: 'a10', action: 'System backup completed', resource: 'system/backup', user: 'System', role: 'Automated', timestamp: '2026-05-16 02:00', ip: '—', severity: 'success', details: 'Full database backup completed. Size: 4.2 GB. Stored in MinIO.' },
  { id: 'a11', action: 'Permission denied', resource: 'awp/dppi-2026/approve', user: 'F. Kamara', role: 'Finance', timestamp: '2026-05-15 16:30', ip: '196.49.x.x', severity: 'error', details: 'Finance role attempted to approve AWP. Action requires Director role or above.' },
  { id: 'a12', action: 'Activity deleted', resource: 'awp/epi-2026/act-7', user: 'I. Turay', role: 'Planner', timestamp: '2026-05-15 14:20', ip: '196.49.x.x', severity: 'warning', details: 'Activity "Polio vaccination campaign" removed from EPI AWP draft.' },
  { id: 'a13', action: 'DHIS2 sync completed', resource: 'integration/dhis2', user: 'System', role: 'Automated', timestamp: '2026-05-15 06:00', ip: '—', severity: 'success', details: '156 indicators synced from national DHIS2 instance. 3 data conflicts flagged.' },
  { id: 'a14', action: 'Password reset initiated', resource: 'user/a.conteh', user: 'A. Conteh', role: 'M&E Officer', timestamp: '2026-05-14 11:15', ip: '196.49.x.x', severity: 'info', details: 'Self-service password reset initiated. Verification email sent.' },
  { id: 'a15', action: 'API rate limit exceeded', resource: 'api/v1/indicators', user: 'External Client', role: 'API', timestamp: '2026-05-14 09:42', ip: '52.14.x.x', severity: 'error', details: 'Rate limit of 100 req/min exceeded. Client throttled for 60 seconds.' },
];

const severityConfig = {
  info: { color: 'bg-brand-500', ring: 'ring-brand-200', bg: 'bg-brand-50', text: 'text-brand-700', icon: Info, label: 'Info' },
  warning: { color: 'bg-amber-500', ring: 'ring-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertTriangle, label: 'Warning' },
  error: { color: 'bg-rose-500', ring: 'ring-rose-200', bg: 'bg-rose-50', text: 'text-rose-700', icon: XCircle, label: 'Error' },
  success: { color: 'bg-emerald-500', ring: 'ring-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2, label: 'Success' },
};

/* ──── Page ──── */

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [liveMode, setLiveMode] = useState(false);

  const severities = ['All', 'info', 'warning', 'error', 'success'];

  const filtered = auditEntries.filter((e) => {
    const matchSearch = e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        e.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = selectedSeverity === 'All' || e.severity === selectedSeverity;
    return matchSearch && matchSeverity;
  });

  // Stats
  const infoCount = auditEntries.filter(e => e.severity === 'info').length;
  const warningCount = auditEntries.filter(e => e.severity === 'warning').length;
  const errorCount = auditEntries.filter(e => e.severity === 'error').length;
  const successCount = auditEntries.filter(e => e.severity === 'success').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">Audit Log</h1>
          <p className="text-muted mt-1">Complete audit trail of all platform actions for compliance and accountability.</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={`btn-sm rounded-lg transition-all ${liveMode ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 font-semibold' : 'btn-outline'}`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${liveMode ? 'animate-spin' : ''}`} />
            {liveMode ? 'Live' : 'Live Mode'}
          </button>
          <button className="btn-outline btn-sm">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </header>

      {/* Severity Summary */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'info' ? 'All' : 'info')}
          className={`card p-4 flex items-center gap-3 text-left transition-all ${selectedSeverity === 'info' ? 'ring-2 ring-brand-300' : ''}`}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50">
            <Info className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{infoCount}</div>
            <div className="text-[11px] text-slate-500">Info Events</div>
          </div>
        </button>
        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'success' ? 'All' : 'success')}
          className={`card p-4 flex items-center gap-3 text-left transition-all ${selectedSeverity === 'success' ? 'ring-2 ring-emerald-300' : ''}`}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{successCount}</div>
            <div className="text-[11px] text-slate-500">Success Events</div>
          </div>
        </button>
        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'warning' ? 'All' : 'warning')}
          className={`card p-4 flex items-center gap-3 text-left transition-all ${selectedSeverity === 'warning' ? 'ring-2 ring-amber-300' : ''}`}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{warningCount}</div>
            <div className="text-[11px] text-slate-500">Warnings</div>
          </div>
        </button>
        <button
          onClick={() => setSelectedSeverity(selectedSeverity === 'error' ? 'All' : 'error')}
          className={`card p-4 flex items-center gap-3 text-left transition-all ${selectedSeverity === 'error' ? 'ring-2 ring-rose-300' : ''}`}
        >
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50">
            <XCircle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{errorCount}</div>
            <div className="text-[11px] text-slate-500">Errors</div>
          </div>
        </button>
      </section>

      {/* Search and Filters */}
      <div className="card-flat p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search actions, users, resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-1.5 text-xs"
          />
        </div>
        <div className="text-xs text-slate-400 ml-auto tabular-nums">
          Showing {filtered.length} of {auditEntries.length} events
        </div>
      </div>

      {/* Audit Timeline */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <div className="flex items-center gap-2">
            <h3 className="heading-section">Event Timeline</h3>
            {liveMode && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((entry) => {
            const sev = severityConfig[entry.severity];
            const SevIcon = sev.icon;
            const isExpanded = expandedEntry === entry.id;

            return (
              <div
                key={entry.id}
                className="transition-colors hover:bg-slate-50/60"
              >
                <button
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  className="w-full text-left px-6 py-4 flex items-start gap-4"
                >
                  {/* Severity indicator */}
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${sev.bg} mt-0.5`}>
                    <SevIcon className={`h-4 w-4 ${sev.text}`} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900">{entry.action}</span>
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 font-mono">{entry.resource}</code>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span className="text-slate-600 font-medium">{entry.user}</span>
                        <span className="text-slate-300">·</span>
                        <span>{entry.role}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="tabular-nums">{entry.timestamp}</span>
                      </span>
                      <span className="hidden sm:flex items-center gap-1 font-mono text-[10px]">
                        {entry.ip}
                      </span>
                    </div>
                  </div>

                  {/* Severity badge */}
                  <span className={`status-pill shrink-0 ${sev.bg} ${sev.text} ring-1 ${sev.ring}`}>
                    {sev.label}
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && entry.details && (
                  <div className="px-6 pb-4 pl-[72px] animate-slide-up">
                    <div className={`rounded-lg ${sev.bg}/50 border border-slate-200/60 p-4`}>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                        <Eye className="h-3 w-3" />
                        Event Details
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{entry.details}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance footer */}
      <div className="card-flat p-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <Shield className="h-4 w-4" />
          <span>All audit entries are immutable and retained for 7 years per MOH data retention policy.</span>
        </div>
        <span className="badge-green text-[10px]">Compliant</span>
      </div>
    </div>
  );
}
