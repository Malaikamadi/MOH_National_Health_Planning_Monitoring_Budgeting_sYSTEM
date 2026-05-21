'use client';

import { useState } from 'react';
import {
  Target,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileDown,
  Plus,
  Search,
  Filter,
  Eye,
  Sliders,
  Sparkles,
  PieChart,
  DollarSign,
  TrendingDown,
  Building2,
  Calendar,
} from 'lucide-react';

/* ──── Mock Strategic Objectives Data ──── */

interface KPI {
  id: string;
  name: string;
  baseline: string;
  current: string;
  target: string;
  status: 'on-track' | 'at-risk' | 'behind';
}

interface StrategicObjective {
  id: string;
  title: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'behind';
  budget: string;
  budgetVal: number;
  description: string;
  kpisList: KPI[];
  alignedSDG: string[];
}

const objectives: StrategicObjective[] = [
  {
    id: 'SO1',
    title: 'Strengthen Health Systems Governance & Leadership',
    progress: 72,
    status: 'on-track',
    budget: 'Le 4.2M',
    budgetVal: 4200000,
    description: 'Improve governance frameworks, policy development, and institutional capacity across all levels of the healthcare delivery system.',
    alignedSDG: ['SDG 3.8', 'SDG 16.6'],
    kpisList: [
      { id: 'kpi-1.1', name: 'Proportion of health facilities with active community oversight boards', baseline: '45%', current: '72%', target: '90%', status: 'on-track' },
      { id: 'kpi-1.2', name: 'Percentage of health policies aligned with the national health framework', baseline: '60%', current: '85%', target: '100%', status: 'on-track' },
      { id: 'kpi-1.3', name: 'DHIS2 reporting timeliness and completeness rate', baseline: '75%', current: '89%', target: '95%', status: 'on-track' },
    ],
  },
  {
    id: 'SO2',
    title: 'Expand Universal Health Coverage & Essential Services',
    progress: 58,
    status: 'at-risk',
    budget: 'Le 12.8M',
    budgetVal: 12800000,
    description: 'Ensure equitable access to quality essential health services, medicines, and technologies without financial hardship for citizens.',
    alignedSDG: ['SDG 3.8', 'SDG 1.3'],
    kpisList: [
      { id: 'kpi-2.1', name: 'Percentage of population covered by the National Health Insurance Scheme', baseline: '5%', current: '18%', target: '50%', status: 'behind' },
      { id: 'kpi-2.2', name: 'Availability of tracer essential medicines in primary health facilities', baseline: '50%', current: '76%', target: '95%', status: 'on-track' },
      { id: 'kpi-2.3', name: 'Out-of-pocket health expenditure as a percentage of total household budget', baseline: '42%', current: '35%', target: '20%', status: 'at-risk' },
    ],
  },
  {
    id: 'SO3',
    title: 'Reduce Maternal, Neonatal & Child Mortality',
    progress: 65,
    status: 'on-track',
    budget: 'Le 8.1M',
    budgetVal: 8100000,
    description: 'Scale up high-impact interventions to prevent and reduce maternal, newborn, and child deaths across all 16 districts.',
    alignedSDG: ['SDG 3.1', 'SDG 3.2'],
    kpisList: [
      { id: 'kpi-3.1', name: 'Maternal Mortality Ratio (per 100,000 live births)', baseline: '717', current: '443', target: '300', status: 'on-track' },
      { id: 'kpi-3.2', name: 'Under-5 Mortality Rate (per 1,000 live births)', baseline: '122', current: '94', target: '80', status: 'on-track' },
      { id: 'kpi-3.3', name: 'Proportion of births attended by skilled health personnel', baseline: '62%', current: '78%', target: '90%', status: 'on-track' },
    ],
  },
  {
    id: 'SO4',
    title: 'Prevent & Control Communicable Diseases',
    progress: 81,
    status: 'on-track',
    budget: 'Le 6.5M',
    budgetVal: 6500000,
    description: 'Strengthen disease surveillance, early detection, response networks, and control programmes for major epidemics and endemic diseases.',
    alignedSDG: ['SDG 3.3'],
    kpisList: [
      { id: 'kpi-4.1', name: 'Malaria incidence rate (per 1,000 population at risk)', baseline: '389', current: '267', target: '200', status: 'on-track' },
      { id: 'kpi-4.2', name: 'Tuberculosis treatment success rate', baseline: '72%', current: '84%', target: '90%', status: 'on-track' },
      { id: 'kpi-4.3', name: 'DPT3 immunization coverage rate among infants', baseline: '78%', current: '89%', target: '95%', status: 'on-track' },
    ],
  },
  {
    id: 'SO5',
    title: 'Address Non-Communicable Diseases & Mental Health',
    progress: 42,
    status: 'behind',
    budget: 'Le 3.4M',
    budgetVal: 3400000,
    description: 'Establish integrated promotion, prevention, screening, and treatment services for NCDs, mental health conditions, and injuries.',
    alignedSDG: ['SDG 3.4', 'SDG 3.5'],
    kpisList: [
      { id: 'kpi-5.1', name: 'Percentage of health facilities offering basic NCD screening and care', baseline: '15%', current: '35%', target: '80%', status: 'behind' },
      { id: 'kpi-5.2', name: 'Proportion of secondary health facilities with dedicated mental health units', baseline: '25%', current: '40%', target: '75%', status: 'at-risk' },
      { id: 'kpi-5.3', name: 'Screening rate for cervical cancer among women aged 30–49', baseline: '2%', current: '8%', target: '30%', status: 'behind' },
    ],
  },
  {
    id: 'SO6',
    title: 'Strengthen Human Resources for Health',
    progress: 55,
    status: 'at-risk',
    budget: 'Le 5.7M',
    budgetVal: 5700000,
    description: 'Optimize the training, recruitment, equitable distribution, and retention of a competent and motivated health workforce.',
    alignedSDG: ['SDG 3.c'],
    kpisList: [
      { id: 'kpi-6.1', name: 'Health worker density (doctors, nurses, midwives per 10,000 population)', baseline: '4.8', current: '7.2', target: '12.0', status: 'behind' },
      { id: 'kpi-6.2', name: 'Retention rate of clinical staff in rural and underserved districts', baseline: '55%', current: '68%', target: '85%', status: 'at-risk' },
      { id: 'kpi-6.3', name: 'Percentage of health workers completing annual CPD modules', baseline: '30%', current: '62%', target: '80%', status: 'on-track' },
    ],
  },
];

const statusColors = {
  'on-track': 'bg-emerald-50 text-emerald-700 ring-emerald-600/10 border border-emerald-200',
  'at-risk': 'bg-amber-50 text-amber-700 ring-amber-600/10 border border-amber-200',
  'behind': 'bg-rose-50 text-rose-700 ring-rose-600/10 border border-rose-200',
};

const statusLabels = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'behind': 'Behind',
};

export default function StrategyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedObjective, setExpandedObjective] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter logic
  const filteredObjectives = objectives.filter((obj) => {
    const matchesSearch = obj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          obj.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          obj.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || obj.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary metrics
  const totalObjectives = objectives.length;
  const onTrackCount = objectives.filter(o => o.status === 'on-track').length;
  const atRiskCount = objectives.filter(o => o.status === 'at-risk').length;
  const behindCount = objectives.filter(o => o.status === 'behind').length;
  
  const totalBudgetVal = objectives.reduce((sum, o) => sum + o.budgetVal, 0);
  const averageProgress = Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ── */}
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">National Health Strategic Plan</h1>
          <p className="text-muted mt-1">
            2024–2028 · Strategic Alignment and key metrics dashboard mapped to SDG targets.
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-outline btn-sm flex items-center gap-1.5">
            <FileDown className="h-3.5 w-3.5" />
            Export Plan (PDF)
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Objective
          </button>
        </div>
      </header>

      {/* ── Strategic Summary Stats Cards ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50">
            <Target className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{totalObjectives}</div>
            <div className="text-xs text-slate-500 font-medium">Strategic Objectives</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{averageProgress}%</div>
            <div className="text-xs text-slate-500 font-medium">Overall Progress</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold-50">
            <DollarSign className="h-6 w-6 text-gold-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">Le 40.7M</div>
            <div className="text-xs text-slate-500 font-medium">Total Strategic Budget</div>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-50">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">
              <span className="text-emerald-600">{onTrackCount}</span>
              <span className="text-slate-300 mx-1.5">/</span>
              <span className="text-amber-600">{atRiskCount}</span>
              <span className="text-slate-300 mx-1.5">/</span>
              <span className="text-rose-600">{behindCount}</span>
            </div>
            <div className="text-xs text-slate-500 font-medium">Status (Track/Risk/Behind)</div>
          </div>
        </div>
      </section>

      {/* ── Filters & Search ── */}
      <div className="card-flat p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {['All', 'on-track', 'at-risk', 'behind'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'All' ? 'All Objectives' : statusLabels[status as keyof typeof statusLabels]}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search objectives or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-2 text-xs"
          />
        </div>
      </div>

      {/* ── Strategic Objectives List ── */}
      <section className="space-y-4">
        {filteredObjectives.map((obj) => {
          const isExpanded = expandedObjective === obj.id;
          return (
            <div 
              key={obj.id} 
              className="card overflow-hidden hover:shadow-card-hover transition-all group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3.5 mb-2">
                      <span className="inline-flex items-center justify-center h-8 w-8 shrink-0 rounded-lg bg-brand-700 text-xs font-bold text-white shadow-sm mt-0.5">
                        {obj.id}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
                          {obj.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                          {obj.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`status-pill uppercase tracking-wider text-[10px] ${statusColors[obj.status]}`}>
                      {statusLabels[obj.status]}
                    </span>
                    <button
                      onClick={() => setExpandedObjective(isExpanded ? null : obj.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
                    >
                      {isExpanded ? <ChevronDown className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Progress bar and details */}
                <div className="mt-4 sm:ml-11 flex flex-wrap items-center gap-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700">Aligned SDGs:</span>
                    <div className="flex gap-1 ml-1">
                      {obj.alignedSDG.map(sdg => (
                        <span key={sdg} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          {sdg}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Strategic Budget:</span>{' '}
                    <span className="font-bold text-slate-900">{obj.budget}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="font-semibold text-slate-700 shrink-0">KPI Target Progress:</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden max-w-[240px]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          obj.status === 'on-track' ? 'bg-emerald-500' :
                          obj.status === 'at-risk' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${obj.progress}%` }}
                      />
                    </div>
                    <span className="font-bold tabular-nums text-slate-800">{obj.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Expanded details (KPI mapping sheet) */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/40 p-6 animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Key Performance Indicator Mapping
                    </h4>
                    <button className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1 transition-colors">
                      <Plus className="h-3.5 w-3.5" /> Add KPI Link
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="min-w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 font-semibold text-slate-500">KPI Identifier</th>
                          <th className="px-4 py-3 font-semibold text-slate-500">Indicator Name</th>
                          <th className="px-4 py-3 font-semibold text-slate-500 text-right">Baseline</th>
                          <th className="px-4 py-3 font-semibold text-slate-500 text-right">Current Value</th>
                          <th className="px-4 py-3 font-semibold text-slate-500 text-right">Target (2028)</th>
                          <th className="px-4 py-3 font-semibold text-slate-500 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {obj.kpisList.map((kpi) => (
                          <tr key={kpi.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 font-bold text-brand-800">{kpi.id}</td>
                            <td className="px-4 py-3 font-medium text-slate-800 max-w-sm leading-relaxed">{kpi.name}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-500">{kpi.baseline}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-bold text-slate-900">{kpi.current}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-500">{kpi.target}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`status-pill uppercase tracking-wider text-[9px] ${statusColors[kpi.status]}`}>
                                {statusLabels[kpi.status]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredObjectives.length === 0 && (
          <div className="card p-12 text-center text-slate-500">
            No strategic objectives match the selected filters.
          </div>
        )}
      </section>

      {/* ── Add Objective Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="section-header">
              <h3 className="heading-section">Create Strategic Objective</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }} className="p-6 space-y-4">
              <div>
                <label className="label text-xs">Objective Title</label>
                <input type="text" required placeholder="e.g. Enhance Digital Health Infrastructure and Reporting" className="input mt-1.5 text-sm" />
              </div>
              <div>
                <label className="label text-xs">Description</label>
                <textarea rows={3} required placeholder="Describe the strategic focus, policy alignment, and scope of this objective..." className="input mt-1.5 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Objective Code</label>
                  <input type="text" required placeholder="e.g. SO7" className="input mt-1.5 text-sm" />
                </div>
                <div>
                  <label className="label text-xs">Strategic Budget</label>
                  <input type="text" required placeholder="e.g. Le 5.5M" className="input mt-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="label text-xs">SDG Alignment</label>
                <input type="text" placeholder="e.g. SDG 3.b, SDG 9.c" className="input mt-1.5 text-sm" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost">Cancel</button>
                <button type="submit" className="btn-primary font-bold">Create Objective</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
