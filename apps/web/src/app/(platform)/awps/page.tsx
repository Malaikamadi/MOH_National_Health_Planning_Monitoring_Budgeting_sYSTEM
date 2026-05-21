'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck2,
  FileDown,
} from 'lucide-react';
import { StatusPill } from '@/components/ui/status-pill';
import type { AwpStatus } from '@/lib/api-client';

/* ──── Mock Data ──── */

interface AwpRecord {
  id: string;
  directorate: string;
  code: string;
  status: AwpStatus;
  submittedAt: string | null;
  budget: string;
  budgetVal: number;
  activities: number;
}

const initialAwps: AwpRecord[] = [
  { id: 'awp-dppi-2026', directorate: 'Policy, Planning & Information', code: 'DPPI', status: 'approved', submittedAt: '2026-03-12', budget: 'Le 2.4M', budgetVal: 2400000, activities: 42 },
  { id: 'awp-dpha-2026', directorate: 'Primary Health Care Administration', code: 'DPHA', status: 'under_review', submittedAt: '2026-03-15', budget: 'Le 5.2M', budgetVal: 5200000, activities: 86 },
  { id: 'awp-dhs-2026',  directorate: 'Hospital Services', code: 'DHS',  status: 'submitted', submittedAt: '2026-03-18', budget: 'Le 3.8M', budgetVal: 3800000, activities: 51 },
  { id: 'awp-rch-2026',  directorate: 'Reproductive & Child Health', code: 'RCH',  status: 'draft', submittedAt: null, budget: 'Le 0.0M', budgetVal: 0, activities: 0 },
  { id: 'awp-ddc-2026',  directorate: 'Disease Prevention & Control', code: 'DDC',  status: 'revisions_requested', submittedAt: '2026-03-10', budget: 'Le 4.1M', budgetVal: 4100000, activities: 64 },
  { id: 'awp-epi-2026',  directorate: 'Epidemiology & Surveillance', code: 'EPI',  status: 'approved', submittedAt: '2026-03-08', budget: 'Le 1.9M', budgetVal: 1900000, activities: 38 },
  { id: 'awp-mch-2026',  directorate: 'Maternal & Child Health', code: 'MCH',  status: 'under_review', submittedAt: '2026-03-14', budget: 'Le 6.1M', budgetVal: 6100000, activities: 72 },
  { id: 'awp-ncd-2026',  directorate: 'NCD & Mental Health', code: 'NCD',  status: 'active', submittedAt: '2026-02-28', budget: 'Le 2.8M', budgetVal: 2800000, activities: 45 },
  { id: 'awp-hr-2026',   directorate: 'Human Resources for Health', code: 'HR',   status: 'approved', submittedAt: '2026-03-05', budget: 'Le 1.6M', budgetVal: 1600000, activities: 34 },
  { id: 'awp-nhp-2026',  directorate: 'National Health Products', code: 'NHP',  status: 'submitted', submittedAt: '2026-03-20', budget: 'Le 8.4M', budgetVal: 8400000, activities: 28 },
];

/* ──── Page ──── */

export default function AwpListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredAwps = initialAwps.filter((awp) => {
    const matchSearch = awp.directorate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        awp.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'All' || awp.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ['All', 'draft', 'submitted', 'under_review', 'approved', 'revisions_requested', 'active'];

  // Summary Metrics
  const totalBudget = initialAwps.reduce((sum, awp) => sum + awp.budgetVal, 0);
  const totalActivities = initialAwps.reduce((sum, awp) => sum + awp.activities, 0);
  const approvedCount = initialAwps.filter(awp => awp.status === 'approved' || awp.status === 'active').length;
  const underReviewCount = initialAwps.filter(awp => awp.status === 'under_review' || awp.status === 'submitted').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">Annual Work Plans</h1>
          <p className="text-muted mt-1">Plan, submit, review and approve directorate AWPs for Fiscal Year 2026.</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-outline btn-sm flex items-center gap-1.5">
            <FileDown className="h-3.5 w-3.5" /> Export Overview
          </button>
          <Link href="/awps/new" className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New AWP
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50">
            <Layers className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{initialAwps.length}</div>
            <div className="text-[11px] text-slate-500">Total Plans</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{approvedCount}</div>
            <div className="text-[11px] text-slate-500">Approved Plans</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{underReviewCount}</div>
            <div className="text-[11px] text-slate-500">Under Review</div>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-50">
            <DollarSign className="h-5 w-5 text-gold-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">Le 36.3M</div>
            <div className="text-[11px] text-slate-500">Total AWP Budget</div>
          </div>
        </div>
      </section>

      {/* Filters and search */}
      <div className="card-flat p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'All' ? 'All Plans' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search directorates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-2 text-xs"
          />
        </div>
      </div>

      {/* AWP listing table */}
      <div className="card overflow-hidden">
        <div className="section-header flex justify-between items-center">
          <div>
            <h3 className="heading-section">Annual Work Plans List</h3>
            <p className="text-xs text-slate-500 mt-0.5">{filteredAwps.length} plans shown</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Directorate</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th className="text-right">Planned Activities</th>
                <th className="text-right">Budget Limit</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAwps.map((awp) => (
                <tr key={awp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td>
                    <div className="font-semibold text-slate-900 text-sm">{awp.directorate}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Reference Code: {awp.code}</div>
                  </td>
                  <td>
                    <StatusPill status={awp.status} />
                  </td>
                  <td className="text-sm text-slate-600 tabular-nums">
                    {awp.submittedAt ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="text-right tabular-nums font-semibold text-slate-800 text-sm">
                    {awp.activities}
                  </td>
                  <td className="text-right tabular-nums font-semibold text-slate-850 text-sm">
                    {awp.budget}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/awps/${awp.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-850 transition-colors"
                    >
                      Workspace <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredAwps.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No work plans match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
