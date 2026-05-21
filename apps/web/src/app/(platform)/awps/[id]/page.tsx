'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  FileCheck2,
  AlertTriangle,
  Clock,
  Layers,
  Send,
  MessageSquare,
  TrendingUp,
  Search,
  CheckCircle2,
  Edit,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { StatusPill } from '@/components/ui/status-pill';
import type { AwpStatus } from '@/lib/api-client';

/* ──── Mock Initial Data ──── */

interface Activity {
  id: string;
  description: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  budget: number;
  indicator: string;
  target: string;
  status: 'pending' | 'completed' | 'ongoing';
}

const initialActivities: Record<string, Activity[]> = {
  'awp-dppi-2026': [
    { id: 'act-1', description: 'Train 50 district officers on digital data capture and DHIS2 reporting.', quarter: 'Q1', budget: 450000, indicator: 'District Reporting Rate', target: '95%', status: 'completed' },
    { id: 'act-2', description: 'Procure 20 server racks and network switches for the national health data center.', quarter: 'Q2', budget: 1200000, indicator: 'Uptime of National Health Registry', target: '99.9%', status: 'ongoing' },
    { id: 'act-3', description: 'Conduct the mid-term review of the National Health Strategic Plan (2024-2028).', quarter: 'Q3', budget: 750000, indicator: 'Mid-term Report Submission', target: 'Submitted', status: 'pending' },
  ],
  'awp-mch-2026': [
    { id: 'act-4', description: 'Distribute 500,000 insecticide-treated bed nets in high-incidence districts.', quarter: 'Q1', budget: 2100000, indicator: 'Net usage rate among pregnant women', target: '85%', status: 'ongoing' },
    { id: 'act-5', description: 'Train 200 Community Health Workers on antenatal care referrals.', quarter: 'Q2', budget: 1500000, indicator: 'Skilled Birth Attendance', target: '90%', status: 'ongoing' },
    { id: 'act-6', description: 'Provide emergency obstetric care kits to 45 peripheral health units.', quarter: 'Q3', budget: 2500000, indicator: 'Maternal Mortality Ratio', target: '<300/100K', status: 'pending' },
  ],
};

const defaultActivities: Activity[] = [
  { id: 'act-d1', description: 'General administrative operations and directorate logistics.', quarter: 'Q1', budget: 200000, indicator: 'Operation Reports', target: '4 submitted', status: 'ongoing' },
  { id: 'act-d2', description: 'Quarterly review meetings and capacity training.', quarter: 'Q2', budget: 350000, indicator: 'Meeting minutes published', target: '4 sets', status: 'pending' },
];

export default function AwpDetailPage() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();

  // Directorate metadata mapped from ID
  const dirName = id.includes('dppi') ? 'Policy, Planning & Information (DPPI)' :
                  id.includes('mch') ? 'Maternal & Child Health (MCH)' :
                  id.includes('dpha') ? 'Primary Health Care Administration (DPHA)' :
                  id.includes('dhs') ? 'Hospital Services (DHS)' :
                  id.includes('ddc') ? 'Disease Prevention & Control (DDC)' :
                  id.includes('epi') ? 'Epidemiology & Surveillance (EPI)' :
                  'Reproductive & Child Health (RCH)';

  const [activities, setActivities] = useState<Activity[]>(() => {
    return initialActivities[id] || defaultActivities;
  });

  const [status, setStatus] = useState<AwpStatus>(() => {
    if (id.includes('dppi') || id.includes('epi')) return 'approved';
    if (id.includes('mch') || id.includes('dpha')) return 'under_review';
    if (id.includes('ddc')) return 'revisions_requested';
    return 'draft';
  });

  const [comments, setComments] = useState<Array<{ user: string; role: string; text: string; time: string }>>([
    { user: 'Dr. Alie Koroma', role: 'Director', text: 'This draft includes all requirements discussed in the FY26 retreat.', time: '2 days ago' },
    { user: 'Platform Admin', role: 'Super Admin', text: 'Please ensure that the budget for Q2 matches the allocations in the ministerial framework.', time: '1 day ago' },
  ]);

  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'activities' | 'budget' | 'comments'>('activities');

  // New activity form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [budget, setBudget] = useState('');
  const [indicator, setIndicator] = useState('');
  const [targetVal, setTargetVal] = useState('');

  // AI assistant simulator state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Budget calculations
  const totalBudget = activities.reduce((sum, act) => sum + act.budget, 0);
  const budgetLimit = id.includes('dppi') ? 3000000 : 7500000;
  const utilizationPct = Math.round((totalBudget / budgetLimit) * 100);

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !budget || !indicator || !targetVal) return;

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      description: desc,
      quarter,
      budget: parseFloat(budget),
      indicator,
      target: targetVal,
      status: 'pending',
    };

    setActivities([...activities, newAct]);
    setShowAddModal(false);
    // Reset form
    setDesc('');
    setQuarter('Q1');
    setBudget('');
    setIndicator('');
    setTargetVal('');
  };

  const handleDeleteActivity = (actId: string) => {
    setActivities(activities.filter(a => a.id !== actId));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      ...comments,
      {
        user: 'Platform Admin',
        role: 'Super Admin',
        text: newComment,
        time: 'Just now',
      },
    ]);
    setNewComment('');
  };

  // Simulate AI Suggestion Engine
  const runAiReview = () => {
    setAiAnalyzing(true);
    setAiSuggestions([]);
    setTimeout(() => {
      setAiAnalyzing(false);
      setAiSuggestions([
        'Budget Alignment: The training activity budget is 15% higher than equivalent activities in last year\'s DPPI work plan. Consider optimizing logistics costs.',
        'Indicator Mapping: The indicator "Uptime of National Health Registry" should be linked to strategic objective SO1.2.',
        'M&E Feasibility: Antenatal care target of 90% is highly ambitious. Check district-level infrastructure capacity in Kono and Kailahun.',
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button and title */}
      <div>
        <Link href="/awps" className="text-xs font-semibold text-brand-700 hover:text-brand-800 mb-3 inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Annual Work Plans
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{dirName}</h1>
            <p className="text-muted mt-1">Fiscal Year 2026 · Plan Reference Code: {id}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={status} />
            <span className="text-xs text-slate-400">|</span>
            <div className="flex gap-2">
              {status === 'draft' && (
                <button
                  onClick={() => setStatus('submitted')}
                  className="btn-accent btn-sm"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Plan
                </button>
              )}
              {status === 'submitted' && (
                <>
                  <button onClick={() => setStatus('revisions_requested')} className="btn-outline btn-sm text-amber-600 border-amber-200 hover:bg-amber-50">
                    Request Revisions
                  </button>
                  <button onClick={() => setStatus('approved')} className="btn-primary btn-sm">
                    Approve Work Plan
                  </button>
                </>
              )}
              {status === 'revisions_requested' && (
                <button onClick={() => setStatus('submitted')} className="btn-accent btn-sm">
                  Resubmit Plan
                </button>
              )}
              {status === 'approved' && (
                <button onClick={() => setStatus('draft')} className="btn-outline btn-sm">
                  Move to Draft
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Budget Card */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="kpi-label">Plan Budget</div>
            <DollarSign className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <div className="kpi-value mt-2">Le {totalBudget.toLocaleString()}</div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Limit: Le {budgetLimit.toLocaleString()}</span>
              <span className={utilizationPct > 100 ? 'text-danger-600 font-semibold' : 'text-slate-600'}>
                {utilizationPct}% utilized
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-bar-fill ${utilizationPct > 100 ? 'bg-danger-500' : 'bg-brand-600'}`}
                style={{ width: `${Math.min(utilizationPct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Activities Card */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="kpi-label">Activities Summary</div>
            <Layers className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <div className="kpi-value mt-2">{activities.length} Planned</div>
          <div className="mt-4 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{activities.filter(a => a.status === 'completed').length} Complete</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              <span>{activities.filter(a => a.status === 'ongoing').length} Ongoing</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span>{activities.filter(a => a.status === 'pending').length} Pending</span>
            </div>
          </div>
        </div>

        {/* AI copilot review suggestion card */}
        <div className="card bg-gradient-to-br from-brand-900 to-brand-950 text-white p-5 border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-24 w-24" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-400">
              <Sparkles className="h-4 w-4" />
              AI Planning Assistant
            </div>
            <h3 className="text-base font-semibold mt-1">Plan Quality Assessment</h3>
            <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
              Analyze work plan alignment, budget feasibility, and indicator coverage using Ministry AI models.
            </p>
            <button
              onClick={runAiReview}
              disabled={aiAnalyzing}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold px-3.5 py-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {aiAnalyzing ? (
                <>
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  Analyzing Plan...
                </>
              ) : (
                <>
                  <Sliders className="h-3.5 w-3.5" />
                  Analyze Work Plan
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* AI Suggestions Display */}
      {aiSuggestions.length > 0 && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-6 space-y-3.5 animate-slide-up">
          <div className="flex items-center gap-2 text-sm font-bold text-brand-900">
            <Sparkles className="h-4.5 w-4.5 text-brand-700" />
            AI Suggestions & Compliance Audit
          </div>
          <ul className="space-y-2 text-xs text-slate-700 list-disc pl-5">
            {aiSuggestions.map((s, idx) => (
              <li key={idx} className="leading-relaxed"><strong className="text-brand-900">{s.split(':')[0]}:</strong>{s.split(':')[1]}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tabbed workspace */}
      <div className="card overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200/80 bg-slate-50/50 flex">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'activities'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Activities List ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'budget'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Quarterly Budget Allocation
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'comments'
                ? 'border-brand-600 text-brand-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Review & Discussion ({comments.length})
          </button>
        </div>

        {/* Tab 1: Activities list */}
        {activeTab === 'activities' && (
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <h3 className="heading-section">Planned Activities</h3>
              {status === 'draft' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary btn-sm"
                >
                  <Plus className="h-4 w-4" /> Add Activity
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Activity Details</th>
                    <th className="w-24">Quarter</th>
                    <th className="text-right w-36">Budget</th>
                    <th>Linked Indicator</th>
                    <th className="w-28 text-center">Status</th>
                    {status === 'draft' && <th className="w-16"></th>}
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act) => (
                    <tr key={act.id}>
                      <td>
                        <div className="font-medium text-slate-900 leading-relaxed max-w-lg">
                          {act.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge-blue font-bold">{act.quarter}</span>
                      </td>
                      <td className="text-right font-semibold tabular-nums text-slate-800">
                        Le {act.budget.toLocaleString()}
                      </td>
                      <td>
                        <div className="text-sm font-medium text-slate-700">{act.indicator}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Target: {act.target}</div>
                      </td>
                      <td className="text-center">
                        <span className={`status-pill ${
                          act.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10' :
                          act.status === 'ongoing' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {act.status}
                        </span>
                      </td>
                      {status === 'draft' && (
                        <td className="text-center">
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="text-slate-400 hover:text-danger-600 transition-colors p-1"
                            title="Remove activity"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Quarterly budget breakdown */}
        {activeTab === 'budget' && (
          <div className="p-6">
            <h3 className="heading-section mb-6">Quarterly Budget Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => {
                const qBudget = activities.filter(a => a.quarter === q).reduce((s, a) => s + a.budget, 0);
                const qPct = totalBudget > 0 ? Math.round((qBudget / totalBudget) * 100) : 0;
                return (
                  <div key={q} className="card-flat p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-800">{q}</span>
                      <span className="text-xs text-slate-500 font-semibold">{qPct}% of plan</span>
                    </div>
                    <div className="text-2xl font-bold text-brand-700">Le {qBudget.toLocaleString()}</div>
                    <div className="space-y-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Activities in {q}</div>
                      <div className="text-sm font-semibold text-slate-800">
                        {activities.filter(a => a.quarter === q).length} items
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Discussion Board */}
        {activeTab === 'comments' && (
          <div className="p-6 space-y-6">
            <h3 className="heading-section">Discussion & Review History</h3>

            <div className="space-y-4 max-w-3xl">
              {comments.map((c, i) => (
                <div key={i} className="flex gap-4">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white shadow-sm">
                    {c.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 rounded-xl bg-slate-50 p-4 border border-slate-200/50">
                    <div className="flex items-center justify-between gap-4 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800">{c.user}</span>
                        <span className="badge-slate text-[10px]">{c.role}</span>
                      </div>
                      <span className="text-xs text-slate-400">{c.time}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-4 max-w-3xl pt-4 border-t border-slate-100">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white shadow-sm">
                PA
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or add planning review comments..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input flex-1 py-2 bg-slate-50 border-slate-200 focus:bg-white text-sm"
                />
                <button type="submit" className="btn-primary py-2.5 px-4 font-bold shrink-0">
                  <MessageSquare className="h-4.5 w-4.5" />
                  Comment
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Activity Modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="section-header">
              <h3 className="heading-section">Add Activity to work plan</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="p-6 space-y-4">
              <div>
                <label className="label" htmlFor="act-desc">Activity Description</label>
                <textarea
                  id="act-desc"
                  rows={2}
                  className="input mt-1.5"
                  required
                  placeholder="e.g. Conduct refresher training on logistics management for 30 midwives..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="act-q">Quarter</label>
                  <select
                    id="act-q"
                    className="input mt-1.5"
                    value={quarter}
                    onChange={(e) => setQuarter(e.target.value as 'Q1' | 'Q2' | 'Q3' | 'Q4')}
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="act-b">Budget (Leones)</label>
                  <input
                    id="act-b"
                    type="number"
                    required
                    className="input mt-1.5"
                    placeholder="e.g. 500000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="act-ind">Indicator Link</label>
                  <input
                    id="act-ind"
                    type="text"
                    required
                    className="input mt-1.5"
                    placeholder="e.g. Skilled Birth Attendance"
                    value={indicator}
                    onChange={(e) => setIndicator(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="act-t">Target Value</label>
                  <input
                    id="act-t"
                    type="text"
                    required
                    className="input mt-1.5"
                    placeholder="e.g. 90% coverage"
                    value={targetVal}
                    onChange={(e) => setTargetVal(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary font-bold"
                >
                  Add Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
