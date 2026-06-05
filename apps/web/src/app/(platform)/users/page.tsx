'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Search,
  UserPlus,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Key,
  Edit,
  Eye,
  X,
  AlertTriangle,
  Building2,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Mail,
  ArrowRight,
  Layers,
} from 'lucide-react';

/* ──── Directorate / Unit / User Hierarchy ──── */

interface UnitAccount {
  id: string;
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

interface DirectorateGroup {
  id: string;
  code: string;
  name: string;
  director: {
    name: string;
    email: string;
    role: 'Director';
    mfaEnabled: boolean;
    lastLogin: string;
    status: 'Active' | 'Inactive';
  };
  units: UnitAccount[];
}

const directorates: DirectorateGroup[] = [
  {
    id: 'dir-dppi',
    code: 'DPPI',
    name: 'Directorate of Policy, Planning & Information',
    director: { name: 'Dr. Alie Koroma', email: 'a.koroma@mohs.gov.sl', role: 'Director', mfaEnabled: true, lastLogin: '1 day ago', status: 'Active' },
    units: [
      { id: 'u-me', unitName: 'M&E Unit', email: 'me.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-04', activitiesPerformance: 64, amountNeeded: 360000, amountUsed: 210000, lastLogin: '2 hours ago', status: 'Active' },
      { id: 'u-plan', unitName: 'Planning Unit', email: 'planning.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-03', activitiesPerformance: 58, amountNeeded: 410000, amountUsed: 226000, lastLogin: '5 hours ago', status: 'Active' },
      { id: 'u-hmis', unitName: 'HMIS Unit', email: 'hmis.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-28', activitiesPerformance: 72, amountNeeded: 290000, amountUsed: 198000, lastLogin: '1 day ago', status: 'Active' },
    ],
  },
  {
    id: 'dir-dphc',
    code: 'DPHC',
    name: 'Directorate of Primary Health Care',
    director: { name: 'Dr. Fatmata Bangura', email: 'f.bangura@mohs.gov.sl', role: 'Director', mfaEnabled: true, lastLogin: '3 hours ago', status: 'Active' },
    units: [
      { id: 'u-epi', unitName: 'EPI Unit', email: 'epi.unit@mohs.gov.sl', awpStatus: 'under_review', awpSubmittedAt: '2026-04-06', activitiesPerformance: 49, amountNeeded: 520000, amountUsed: 231000, lastLogin: '6 hours ago', status: 'Active' },
      { id: 'u-nut', unitName: 'Nutrition Unit', email: 'nutrition.unit@mohs.gov.sl', awpStatus: 'draft', awpSubmittedAt: null, activitiesPerformance: 30, amountNeeded: 250000, amountUsed: 90000, lastLogin: '2 days ago', status: 'Active' },
      { id: 'u-chw', unitName: 'CHW Programme', email: 'chw.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-02', activitiesPerformance: 68, amountNeeded: 480000, amountUsed: 312000, lastLogin: '4 hours ago', status: 'Active' },
      { id: 'u-rh', unitName: 'RH Unit', email: 'rh.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-30', activitiesPerformance: 55, amountNeeded: 395000, amountUsed: 190000, lastLogin: '1 day ago', status: 'Active' },
    ],
  },
  {
    id: 'dir-dpc',
    code: 'DPC',
    name: 'Directorate of Disease Prevention & Control',
    director: { name: 'Dr. James Kargbo', email: 'j.kargbo@mohs.gov.sl', role: 'Director', mfaEnabled: true, lastLogin: '4 hours ago', status: 'Active' },
    units: [
      { id: 'u-surv', unitName: 'Surveillance Unit', email: 'surveillance.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-01', activitiesPerformance: 71, amountNeeded: 470000, amountUsed: 320000, lastLogin: '1 hour ago', status: 'Active' },
      { id: 'u-lab', unitName: 'Laboratory Unit', email: 'lab.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-05', activitiesPerformance: 61, amountNeeded: 300000, amountUsed: 160000, lastLogin: '3 hours ago', status: 'Active' },
      { id: 'u-malaria', unitName: 'Malaria Unit', email: 'malaria.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-25', activitiesPerformance: 76, amountNeeded: 550000, amountUsed: 398000, lastLogin: '5 hours ago', status: 'Active' },
    ],
  },
  {
    id: 'dir-dhs',
    code: 'DHS',
    name: 'Directorate of Hospital Services',
    director: { name: 'Dr. Mohamed Sesay', email: 'm.sesay@mohs.gov.sl', role: 'Director', mfaEnabled: false, lastLogin: '1 day ago', status: 'Active' },
    units: [
      { id: 'u-pharm', unitName: 'Pharmacy Unit', email: 'pharmacy.unit@mohs.gov.sl', awpStatus: 'under_review', awpSubmittedAt: '2026-04-08', activitiesPerformance: 42, amountNeeded: 620000, amountUsed: 240000, lastLogin: '6 hours ago', status: 'Active' },
      { id: 'u-ncd', unitName: 'NCD Unit', email: 'ncd.unit@mohs.gov.sl', awpStatus: 'not_started', awpSubmittedAt: null, activitiesPerformance: 0, amountNeeded: 180000, amountUsed: 0, lastLogin: 'Never', status: 'Pending' },
      { id: 'u-mental', unitName: 'Mental Health Unit', email: 'mentalhealth.unit@mohs.gov.sl', awpStatus: 'draft', awpSubmittedAt: null, activitiesPerformance: 15, amountNeeded: 120000, amountUsed: 18000, lastLogin: '1 week ago', status: 'Inactive' },
    ],
  },
  {
    id: 'dir-hr',
    code: 'DHRH',
    name: 'Directorate of Human Resources for Health',
    director: { name: 'Dr. Ibrahim Turay', email: 'i.turay@mohs.gov.sl', role: 'Director', mfaEnabled: true, lastLogin: '2 hours ago', status: 'Active' },
    units: [
      { id: 'u-training', unitName: 'Training Unit', email: 'training.unit@mohs.gov.sl', awpStatus: 'submitted', awpSubmittedAt: '2026-04-07', activitiesPerformance: 53, amountNeeded: 340000, amountUsed: 172000, lastLogin: '8 hours ago', status: 'Active' },
      { id: 'u-deploy', unitName: 'Deployment & Staffing', email: 'deployment.unit@mohs.gov.sl', awpStatus: 'approved', awpSubmittedAt: '2026-03-22', activitiesPerformance: 67, amountNeeded: 280000, amountUsed: 185000, lastLogin: '3 hours ago', status: 'Active' },
    ],
  },
];

const awpStatusConfig: Record<UnitAccount['awpStatus'], { label: string; badge: string }> = {
  submitted: { label: 'Submitted', badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/20' },
  draft: { label: 'Draft', badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  under_review: { label: 'Under Review', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/20' },
  approved: { label: 'Approved', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/20' },
  not_started: { label: 'Not Started', badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/20' },
};

const statusIcon: Record<string, { color: string; dot: string }> = {
  Active: { color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Inactive: { color: 'text-slate-400 dark:text-slate-500', dot: 'bg-slate-300 dark:bg-slate-600' },
  Pending: { color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
};

function formatLeones(value: number): string {
  if (value >= 1_000_000) return `Le ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Le ${(value / 1_000).toFixed(0)}K`;
  return `Le ${value}`;
}

/* ──── Page ──── */

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<(UnitAccount & { directorate: string }) | null>(null);
  const [expandedDirectorate, setExpandedDirectorate] = useState<string | null>(directorates[0]?.id ?? null);

  // Flatten all units for searching
  const allUnits = directorates.flatMap((d) =>
    d.units.map((u) => ({ ...u, directorateCode: d.code, directorateName: d.name }))
  );

  const filteredDirectorates = directorates.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(term) ||
      d.code.toLowerCase().includes(term) ||
      d.director.name.toLowerCase().includes(term) ||
      d.units.some(
        (u) =>
          u.unitName.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      )
    );
  });

  // Stats
  const totalUnits = allUnits.length;
  const totalDirectorates = directorates.length;
  const activeUnits = allUnits.filter((u) => u.status === 'Active').length;
  const submittedCount = allUnits.filter((u) => u.awpStatus === 'submitted' || u.awpStatus === 'approved').length;
  const totalNeeded = allUnits.reduce((s, u) => s + u.amountNeeded, 0);
  const totalUsed = allUnits.reduce((s, u) => s + u.amountUsed, 0);
  const mfaDirectors = directorates.filter((d) => d.director.mfaEnabled).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page dark:text-white">User Management</h1>
          <p className="text-muted mt-1 dark:text-slate-400">
            Directorates, units, and accounts. Each directorate director is an admin. Each unit has its own account to submit AWPs.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-outline btn-sm">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary btn-sm"
          >
            <UserPlus className="h-3.5 w-3.5" /> Add Unit Account
          </button>
        </div>
      </header>

      {/* User Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 flex items-center gap-3 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-50 dark:bg-accent-900/30">
            <Building2 className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{totalDirectorates}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Directorates</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 dark:bg-brand-900/30">
            <Users className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{totalUnits}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Unit Accounts ({activeUnits} active)</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
            <ClipboardCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{submittedCount} / {totalUnits}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">AWPs Submitted / Approved</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3 dark:border-slate-800/80 dark:bg-slate-900">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-50 dark:bg-gold-900/30">
            <Shield className="h-5 w-5 text-gold-600 dark:text-gold-400" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{mfaDirectors} / {totalDirectorates}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Directors with MFA</div>
          </div>
        </div>
      </section>

      {/* MFA Warning */}
      {mfaDirectors < totalDirectorates && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3 dark:border-amber-800/40 dark:bg-amber-950/20">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">MFA Compliance Warning</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              {totalDirectorates - mfaDirectors} director(s) have not enabled Multi-Factor Authentication.
              MFA is required for all Directors (admin accounts) per platform security policy.
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card-flat p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Layers className="h-4 w-4 inline-block mr-1.5 text-accent-600 dark:text-accent-400" />
          Directorate → Unit Hierarchy
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search directorates, units, emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-1.5 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
      </div>

      {/* Directorate Accordion List */}
      <div className="space-y-4">
        {filteredDirectorates.map((dir) => {
          const isExpanded = expandedDirectorate === dir.id;
          const dirSubmitted = dir.units.filter((u) => u.awpStatus === 'submitted' || u.awpStatus === 'approved').length;
          const dirTotalNeeded = dir.units.reduce((s, u) => s + u.amountNeeded, 0);
          const dirTotalUsed = dir.units.reduce((s, u) => s + u.amountUsed, 0);
          const dirUtilization = dirTotalNeeded > 0 ? Math.round((dirTotalUsed / dirTotalNeeded) * 100) : 0;
          const avgPerf = dir.units.length > 0 ? Math.round(dir.units.reduce((s, u) => s + u.activitiesPerformance, 0) / dir.units.length) : 0;

          return (
            <div key={dir.id} className="card overflow-hidden transition-all hover:shadow-card-hover dark:border-slate-800/80 dark:bg-slate-900">
              {/* Directorate Header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedDirectorate(isExpanded ? null : dir.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-50 dark:bg-accent-900/30">
                      <Building2 className="h-5 w-5 text-accent-700 dark:text-accent-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="badge-blue font-bold text-xs">{dir.code}</span>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{dir.name}</h3>
                      </div>
                      <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Shield className="h-3 w-3 text-accent-600 dark:text-accent-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{dir.director.name}</span>
                          <span className="text-slate-400 dark:text-slate-500">(Director / Admin)</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                          {dir.director.email}
                        </span>
                        {dir.director.mfaEnabled && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Shield className="h-3 w-3" /> MFA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-5 text-xs text-slate-500 dark:text-slate-400">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{dir.units.length}</div>
                        <div>Units</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{dirSubmitted}/{dir.units.length}</div>
                        <div>AWPs Filed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{avgPerf}%</div>
                        <div>Performance</div>
                      </div>
                    </div>
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 dark:text-slate-500">
                      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded: Unit Accounts Table */}
              {isExpanded && (
                <div className="border-t border-slate-200/80 bg-slate-50/30 animate-slide-up dark:border-slate-800/70 dark:bg-slate-800/20">
                  <div className="px-5 py-3 flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Unit Accounts — Each unit submits its own AWP
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Data feeds → {dir.code} → CMO → Leadership
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead className="dark:bg-slate-800/70">
                        <tr>
                          <th>Unit Account</th>
                          <th>AWP Status</th>
                          <th>Submitted</th>
                          <th className="text-right">Performance</th>
                          <th className="text-right">Amount Needed</th>
                          <th className="text-right">Amount Used</th>
                          <th>Account Status</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dir.units.map((unit) => {
                          const utilPct = unit.amountNeeded > 0 ? Math.round((unit.amountUsed / unit.amountNeeded) * 100) : 0;
                          return (
                            <tr key={unit.id} className="dark:border-slate-800/60 dark:hover:bg-slate-800/50">
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
                                <span className={`status-pill ${awpStatusConfig[unit.awpStatus].badge}`}>
                                  {awpStatusConfig[unit.awpStatus].label}
                                </span>
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
                                {(() => {
                                  const st = statusIcon[unit.status] ?? { color: 'text-slate-400', dot: 'bg-slate-300' };
                                  return (
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${st.color}`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot} ${unit.status === 'Active' ? 'animate-pulse-slow' : ''}`} />
                                      {unit.status}
                                    </span>
                                  );
                                })()}
                              </td>
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedUnit({ ...unit, directorate: dir.code });
                                    }}
                                    className="btn-ghost p-1.5 rounded-lg"
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="btn-ghost p-1.5 rounded-lg" title="Edit unit">
                                    <Edit className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Directorate summary bar */}
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/60 dark:border-slate-800/50 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Total Budget: <span className="font-bold text-slate-800 dark:text-slate-100">{formatLeones(dirTotalNeeded)}</span>
                    </span>
                    <span>
                      Used: <span className="font-bold text-slate-800 dark:text-slate-100">{formatLeones(dirTotalUsed)}</span>
                      <span className="ml-1">({dirUtilization}%)</span>
                    </span>
                    <span>
                      Avg Performance: <span className="font-bold text-slate-800 dark:text-slate-100">{avgPerf}%</span>
                    </span>
                    <Link
                      href="/awps"
                      className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-accent-700 dark:text-accent-400 hover:text-accent-800 dark:hover:text-accent-300 transition-colors"
                    >
                      View {dir.code} AWPs <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Data Feed Explainer */}
      <section className="card p-6 dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-50 dark:bg-accent-900/30">
            <Layers className="h-6 w-6 text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h3 className="heading-section dark:text-white">Data Feed Hierarchy</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Each unit submits its AWP independently. Unit data feeds into the <span className="font-semibold">Directorate master</span>, then aggregates to
              the <span className="font-semibold">CMO</span> and <span className="font-semibold">Leadership</span> level for national planning decisions.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="badge-blue">Unit Account</span>
              <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              <span className="badge-green">Directorate Master</span>
              <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              <span className="badge-amber">CMO Office</span>
              <ArrowRight className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              <span className="bg-accent-50 text-accent-700 ring-1 ring-accent-600/10 dark:bg-accent-950/40 dark:text-accent-300 dark:ring-accent-500/20 badge">Leadership</span>
            </div>
          </div>
        </div>
      </section>

      {/* Invite Unit Account Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg overflow-hidden animate-scale-in dark:border-slate-700 dark:bg-slate-900">
            <div className="section-header dark:border-slate-800/80">
              <h3 className="heading-section dark:text-white">Create Unit Account</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="label text-xs dark:text-slate-300" htmlFor="inv-unit">Unit Name</label>
                <input id="inv-unit" type="text" className="input mt-1.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="e.g. Surveillance Unit" />
              </div>
              <div>
                <label className="label text-xs dark:text-slate-300" htmlFor="inv-email">Unit Email Account</label>
                <input id="inv-email" type="email" className="input mt-1.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="unit@mohs.gov.sl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs dark:text-slate-300" htmlFor="inv-dir">Directorate</label>
                  <select id="inv-dir" className="input mt-1.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    {directorates.map((d) => (
                      <option key={d.id} value={d.code}>{d.code} — {d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs dark:text-slate-300" htmlFor="inv-role">Account Type</label>
                  <select id="inv-role" className="input mt-1.5 dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                    <option>Unit Account</option>
                    <option>Director (Admin)</option>
                    <option>Viewer</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="inv-awp" className="rounded border-slate-300 text-accent-700 focus:ring-accent-500 dark:border-slate-600 dark:bg-slate-800" defaultChecked />
                <label htmlFor="inv-awp" className="text-sm text-slate-700 dark:text-slate-300">Enable AWP submission for this unit</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 justify-end">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-ghost">Cancel</button>
                <button type="button" className="btn-primary font-bold">
                  <UserPlus className="h-4 w-4" /> Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md overflow-hidden animate-scale-in dark:border-slate-700 dark:bg-slate-900">
            <div className="section-header dark:border-slate-800/80">
              <h3 className="heading-section dark:text-white">Unit Account Details</h3>
              <button onClick={() => setSelectedUnit(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-600 to-accent-800 text-lg font-bold text-white shadow-md">
                  {selectedUnit.unitName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{selectedUnit.unitName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUnit.email}</p>
                  <span className="badge-blue text-[10px] mt-1">{selectedUnit.directorate}</span>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card-flat p-3 space-y-1 dark:border-slate-800/70 dark:bg-slate-800/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">AWP Status</div>
                  <span className={`status-pill ${awpStatusConfig[selectedUnit.awpStatus].badge}`}>
                    {awpStatusConfig[selectedUnit.awpStatus].label}
                  </span>
                </div>
                <div className="card-flat p-3 space-y-1 dark:border-slate-800/70 dark:bg-slate-800/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Performance</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{selectedUnit.activitiesPerformance}%</div>
                </div>
                <div className="card-flat p-3 space-y-1 dark:border-slate-800/70 dark:bg-slate-800/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Amount Needed</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{formatLeones(selectedUnit.amountNeeded)}</div>
                </div>
                <div className="card-flat p-3 space-y-1 dark:border-slate-800/70 dark:bg-slate-800/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Amount Used</div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white">{formatLeones(selectedUnit.amountUsed)}</div>
                </div>
                <div className="card-flat p-3 space-y-1 dark:border-slate-800/70 dark:bg-slate-800/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Last Login</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-white">{selectedUnit.lastLogin}</div>
                </div>
                <div className="card-flat p-3 space-y-1 dark:border-slate-800/70 dark:bg-slate-800/50">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Account Status</div>
                  {(() => {
                    const st = statusIcon[selectedUnit.status] ?? { color: 'text-slate-450', dot: 'bg-slate-300' };
                    return (
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${st.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {selectedUnit.status}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link href="/awps/new" className="btn-outline flex-1 text-xs">
                  <ClipboardCheck className="h-3.5 w-3.5" /> Submit AWP
                </Link>
                <button className="btn-outline flex-1 text-xs">
                  <Key className="h-3.5 w-3.5" /> Reset Password
                </button>
                <button onClick={() => setSelectedUnit(null)} className="btn-ghost text-xs">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
