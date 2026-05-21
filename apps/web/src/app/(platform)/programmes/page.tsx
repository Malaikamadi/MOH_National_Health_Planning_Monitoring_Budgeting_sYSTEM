'use client';

import { useState } from 'react';
import {
  Building2,
  Users,
  MapPin,
  Briefcase,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Target,
  Activity,
  Heart,
  Shield,
  Zap,
  Syringe,
  Baby,
  Droplets,
  Brain,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
} from 'lucide-react';

/* ──── Mock Data ──── */

interface Programme {
  id: string;
  name: string;
  shortName: string;
  lead: string;
  districts: number;
  staff: number;
  budget: number;
  spent: number;
  status: 'Active' | 'Scaling' | 'Pilot' | 'Suspended';
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  kpis: { label: string; value: string; trend: 'up' | 'down' | 'flat' }[];
  milestones: { name: string; complete: boolean }[];
  fundingSources: string[];
}

const programmes: Programme[] = [
  {
    id: 'epi',
    name: 'Expanded Programme on Immunization (EPI)',
    shortName: 'EPI',
    lead: 'Dr. M. Kamara',
    districts: 16,
    staff: 342,
    budget: 4800000,
    spent: 2160000,
    status: 'Active',
    color: 'bg-emerald-500',
    icon: Syringe,
    description: 'National immunization programme targeting all children under 5 and pregnant women across all districts.',
    kpis: [
      { label: 'DPT3 Coverage', value: '89%', trend: 'up' },
      { label: 'Measles Coverage', value: '82%', trend: 'up' },
      { label: 'Zero-Dose Children', value: '4.2%', trend: 'down' },
    ],
    milestones: [
      { name: 'Cold chain equipment procured', complete: true },
      { name: 'Q1 vaccination drives completed', complete: true },
      { name: 'Training of 200 vaccinators', complete: true },
      { name: 'Mid-year coverage assessment', complete: false },
      { name: 'National Immunization Week campaign', complete: false },
    ],
    fundingSources: ['GAVI', 'WHO', 'UNICEF', 'GoSL'],
  },
  {
    id: 'fhci',
    name: 'Free Health Care Initiative (FHCI)',
    shortName: 'FHCI',
    lead: 'Dr. A. Sesay',
    districts: 16,
    staff: 1240,
    budget: 18200000,
    spent: 8190000,
    status: 'Active',
    color: 'bg-brand-500',
    icon: Heart,
    description: 'Free healthcare for pregnant women, lactating mothers, and children under 5 in all government facilities.',
    kpis: [
      { label: 'Facility Utilization', value: '78%', trend: 'up' },
      { label: 'Drug Stock-Out Rate', value: '12%', trend: 'down' },
      { label: 'Patient Satisfaction', value: '74%', trend: 'up' },
    ],
    milestones: [
      { name: 'Drug procurement round 1', complete: true },
      { name: 'Staff deployment to rural PHUs', complete: true },
      { name: 'Facility upgrade — 30 PHUs', complete: false },
      { name: 'Community awareness campaign', complete: false },
    ],
    fundingSources: ['GoSL', 'World Bank', 'DFID', 'EU'],
  },
  {
    id: 'malaria',
    name: 'Malaria Control Programme',
    shortName: 'Malaria',
    lead: 'M. Bangura',
    districts: 14,
    staff: 186,
    budget: 6100000,
    spent: 3355000,
    status: 'Active',
    color: 'bg-accent-500',
    icon: Shield,
    description: 'Integrated malaria prevention and treatment programme with ITN distribution and indoor residual spraying.',
    kpis: [
      { label: 'Malaria Incidence', value: '267/1K', trend: 'down' },
      { label: 'ITN Usage Rate', value: '68%', trend: 'up' },
      { label: 'Case Fatality Rate', value: '0.8%', trend: 'down' },
    ],
    milestones: [
      { name: '500K ITNs distributed', complete: true },
      { name: 'IRS in 8 high-burden districts', complete: true },
      { name: 'RDT supply chain strengthened', complete: false },
      { name: 'Seasonal malaria chemoprevention', complete: false },
    ],
    fundingSources: ['Global Fund', 'PMI', 'WHO'],
  },
  {
    id: 'hiv',
    name: 'HIV/AIDS & TB Control',
    shortName: 'HIV/TB',
    lead: 'Dr. F. Conteh',
    districts: 16,
    staff: 228,
    budget: 5400000,
    spent: 2430000,
    status: 'Active',
    color: 'bg-gold-500',
    icon: Zap,
    description: 'National programme for HIV testing, ART provision, TB screening and treatment across all health facilities.',
    kpis: [
      { label: 'ART Coverage', value: '72%', trend: 'up' },
      { label: 'TB Treatment Success', value: '84%', trend: 'up' },
      { label: 'HIV Testing Rate', value: '45%', trend: 'up' },
    ],
    milestones: [
      { name: 'ART site expansion to 12 new sites', complete: true },
      { name: 'GeneXpert machines installed', complete: true },
      { name: 'Community TB screening drives', complete: false },
      { name: 'PMTCT scale-up', complete: false },
    ],
    fundingSources: ['Global Fund', 'PEPFAR', 'WHO', 'GoSL'],
  },
  {
    id: 'rh',
    name: 'Reproductive Health Programme',
    shortName: 'RH',
    lead: 'A. Koroma',
    districts: 16,
    staff: 412,
    budget: 7900000,
    spent: 3160000,
    status: 'Active',
    color: 'bg-rose-500',
    icon: Baby,
    description: 'Comprehensive reproductive health services including family planning, safe motherhood, and adolescent health.',
    kpis: [
      { label: 'Contraceptive Prevalence', value: '24%', trend: 'up' },
      { label: 'Skilled Birth Attendance', value: '78%', trend: 'up' },
      { label: 'Maternal Mortality Ratio', value: '443/100K', trend: 'down' },
    ],
    milestones: [
      { name: 'EmONC training for 150 midwives', complete: true },
      { name: 'FP commodity procurement', complete: true },
      { name: 'Adolescent health centers — 8 districts', complete: false },
      { name: 'Maternal death surveillance rollout', complete: false },
    ],
    fundingSources: ['UNFPA', 'USAID', 'GoSL', 'DFID'],
  },
  {
    id: 'nutrition',
    name: 'Nutrition Programme',
    shortName: 'Nutrition',
    lead: 'S. Mansaray',
    districts: 12,
    staff: 95,
    budget: 2300000,
    spent: 690000,
    status: 'Scaling',
    color: 'bg-amber-500',
    icon: Droplets,
    description: 'Community-based nutrition interventions including CMAM, IYCF counseling, and micronutrient supplementation.',
    kpis: [
      { label: 'Stunting Prevalence', value: '26%', trend: 'down' },
      { label: 'CMAM Recovery Rate', value: '82%', trend: 'up' },
      { label: 'Exclusive Breastfeeding', value: '58%', trend: 'up' },
    ],
    milestones: [
      { name: 'CMAM sites operational in 12 districts', complete: true },
      { name: 'IYCF counselor training', complete: false },
      { name: 'School feeding programme pilot', complete: false },
    ],
    fundingSources: ['UNICEF', 'WFP', 'GoSL'],
  },
  {
    id: 'wash',
    name: 'WASH in Health Facilities',
    shortName: 'WASH',
    lead: 'J. Kargbo',
    districts: 10,
    staff: 67,
    budget: 1800000,
    spent: 360000,
    status: 'Pilot',
    color: 'bg-sky-500',
    icon: Droplets,
    description: 'Improving water, sanitation, and hygiene infrastructure in primary health facilities.',
    kpis: [
      { label: 'Facilities with Clean Water', value: '64%', trend: 'up' },
      { label: 'Handwashing Stations', value: '52%', trend: 'up' },
      { label: 'Waste Management', value: '38%', trend: 'up' },
    ],
    milestones: [
      { name: 'Baseline assessment completed', complete: true },
      { name: 'Pilot installations — 10 facilities', complete: false },
      { name: 'Community hygiene promotion', complete: false },
    ],
    fundingSources: ['UNICEF', 'World Bank', 'GoSL'],
  },
  {
    id: 'chw',
    name: 'Community Health Workers (CHW)',
    shortName: 'CHW',
    lead: 'Dr. I. Turay',
    districts: 16,
    staff: 15000,
    budget: 9600000,
    spent: 5280000,
    status: 'Active',
    color: 'bg-violet-500',
    icon: Users,
    description: 'National CHW programme deploying 15,000 community health workers for primary care at the doorstep.',
    kpis: [
      { label: 'CHWs Deployed', value: '14,200', trend: 'up' },
      { label: 'Home Visits/Month', value: '128K', trend: 'up' },
      { label: 'Referral Completion', value: '71%', trend: 'up' },
    ],
    milestones: [
      { name: 'Q1 stipend payments disbursed', complete: true },
      { name: 'Refresher training — all districts', complete: true },
      { name: 'Digital reporting app rollout', complete: false },
      { name: 'Performance-based incentive pilot', complete: false },
    ],
    fundingSources: ['GoSL', 'World Bank', 'USAID', 'UNICEF'],
  },
];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `Le ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Le ${(value / 1_000).toFixed(0)}K`;
  return `Le ${value}`;
}

const statusBadge: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  Scaling: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
  Pilot: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  Suspended: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10',
};

/* ──── Page ──── */

export default function ProgrammesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('All');

  const statuses = ['All', 'Active', 'Scaling', 'Pilot'];

  const filteredProgrammes = programmes.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.lead.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  // Summary
  const totalBudget = programmes.reduce((s, p) => s + p.budget, 0);
  const totalSpent = programmes.reduce((s, p) => s + p.spent, 0);
  const totalStaff = programmes.reduce((s, p) => s + p.staff, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">Health Programmes</h1>
          <p className="text-muted mt-1">National health programmes managed by the Ministry of Health and Sanitation.</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-outline btn-sm">Export Overview</button>
          <button className="btn-primary btn-sm">
            <Target className="h-3.5 w-3.5" /> Programme Matrix
          </button>
        </div>
      </header>

      {/* Summary KPIs */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50">
            <Activity className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{programmes.length}</div>
            <div className="text-[11px] text-slate-500">Active Programmes</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-50">
            <DollarSign className="h-5 w-5 text-gold-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{formatCurrency(totalBudget)}</div>
            <div className="text-[11px] text-slate-500">Total Budget</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-50">
            <Users className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{totalStaff.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Total Staff</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50">
            <TrendingUp className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{Math.round((totalSpent / totalBudget) * 100)}%</div>
            <div className="text-[11px] text-slate-500">Budget Utilization</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="card-flat p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === s ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search programmes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Programme Cards */}
      <div className="space-y-4">
        {filteredProgrammes.map((prog) => {
          const isExpanded = expandedId === prog.id;
          const utilPct = Math.round((prog.spent / prog.budget) * 100);
          const completedMilestones = prog.milestones.filter(m => m.complete).length;

          return (
            <div key={prog.id} className="card overflow-hidden transition-all hover:shadow-card-hover">
              {/* Color strip */}
              <div className={`h-1 ${prog.color}`} />

              {/* Main card body */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${prog.color}/10`}>
                      <prog.icon className={`h-5.5 w-5.5 ${prog.color.replace('bg-', 'text-').replace('-500', '-600')}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-semibold text-slate-900">{prog.name}</h3>
                        <span className={`status-pill ${statusBadge[prog.status]}`}>{prog.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-2xl">{prog.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : prog.id)}
                    className="btn-ghost p-2 rounded-lg shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>

                {/* Quick stats row */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span><span className="font-semibold text-slate-700">{prog.lead}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span><span className="font-semibold text-slate-700">{prog.staff.toLocaleString()}</span> staff</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span><span className="font-semibold text-slate-700">{prog.districts}</span> districts</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-700">{formatCurrency(prog.budget)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-[100px]">
                      <div
                        className={`h-full rounded-full ${prog.color} transition-all duration-700`}
                        style={{ width: `${utilPct}%` }}
                      />
                    </div>
                    <span className="font-semibold text-slate-600 tabular-nums">{utilPct}% used</span>
                  </div>
                </div>
              </div>

              {/* Expanded section */}
              {isExpanded && (
                <div className="border-t border-slate-200/80 bg-slate-50/30 animate-slide-up">
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* KPIs */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Performance Indicators</h4>
                      <div className="space-y-3">
                        {prog.kpis.map((kpi) => (
                          <div key={kpi.label} className="card-flat p-3 flex items-center justify-between bg-white">
                            <span className="text-sm text-slate-700">{kpi.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 tabular-nums">{kpi.value}</span>
                              <TrendingUp className={`h-3.5 w-3.5 ${
                                kpi.trend === 'up' ? 'text-emerald-500' :
                                kpi.trend === 'down' ? 'text-emerald-500 rotate-180' : 'text-slate-400'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Milestones ({completedMilestones}/{prog.milestones.length})
                      </h4>
                      <div className="space-y-2.5">
                        {prog.milestones.map((ms, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            {ms.complete ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <Clock className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
                            )}
                            <span className={`text-sm ${ms.complete ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                              {ms.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                          style={{ width: `${(completedMilestones / prog.milestones.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Budget & Funding */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Budget & Funding</h4>
                      <div className="card-flat p-4 bg-white space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Allocated</span>
                          <span className="font-bold text-slate-900">{formatCurrency(prog.budget)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Spent</span>
                          <span className="font-bold text-slate-900">{formatCurrency(prog.spent)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Remaining</span>
                          <span className="font-bold text-emerald-700">{formatCurrency(prog.budget - prog.spent)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              utilPct > 80 ? 'bg-amber-500' : 'bg-brand-500'
                            }`}
                            style={{ width: `${utilPct}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-500 mb-2">Funding Sources</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {prog.fundingSources.map((f) => (
                            <span key={f} className="badge-slate text-[10px]">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
