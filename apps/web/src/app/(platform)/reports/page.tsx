'use client';

import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  BarChart3,
  PieChart,
  TrendingUp,
  Eye,
  Share2,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  FileBarChart,
  Printer,
  X,
} from 'lucide-react';

/* ──── Mock Data ──── */

interface Report {
  id: string;
  title: string;
  type: 'Quarterly' | 'Annual' | 'District' | 'Programme' | 'Financial' | 'HR' | 'Ad Hoc';
  date: string;
  status: 'Published' | 'Draft' | 'Under Review' | 'Scheduled';
  size: string;
  author: string;
  downloads: number;
  pages: number;
}

const reports: Report[] = [
  { id: 'r1', title: 'Q1 2026 Performance Report', type: 'Quarterly', date: '2026-04-15', status: 'Published', size: '2.4 MB', author: 'Dr. A. Koroma', downloads: 142, pages: 38 },
  { id: 'r2', title: 'FY 2025 Annual Report', type: 'Annual', date: '2026-02-28', status: 'Published', size: '8.1 MB', author: 'MOH Planning Unit', downloads: 327, pages: 112 },
  { id: 'r3', title: 'District Health Profile — Western Area', type: 'District', date: '2026-03-10', status: 'Published', size: '1.8 MB', author: 'M. Sesay', downloads: 89, pages: 24 },
  { id: 'r4', title: 'Maternal Health Dashboard Summary', type: 'Programme', date: '2026-03-22', status: 'Published', size: '956 KB', author: 'MCH Division', downloads: 204, pages: 16 },
  { id: 'r5', title: 'Q2 2026 Performance Report', type: 'Quarterly', date: '2026-06-15', status: 'Scheduled', size: '—', author: 'Auto-generated', downloads: 0, pages: 0 },
  { id: 'r6', title: 'EPI Coverage Analysis', type: 'Programme', date: '2026-04-02', status: 'Published', size: '1.2 MB', author: 'EPI Division', downloads: 156, pages: 22 },
  { id: 'r7', title: 'Budget Execution Report — Q1', type: 'Financial', date: '2026-04-20', status: 'Under Review', size: '3.5 MB', author: 'F. Kamara', downloads: 12, pages: 45 },
  { id: 'r8', title: 'HR Deployment Status Report', type: 'HR', date: '2026-03-30', status: 'Published', size: '780 KB', author: 'HR Division', downloads: 67, pages: 18 },
  { id: 'r9', title: 'Malaria Incidence Monthly Bulletin', type: 'Programme', date: '2026-05-01', status: 'Published', size: '420 KB', author: 'DDC Division', downloads: 198, pages: 8 },
  { id: 'r10', title: 'Supply Chain Inventory Report', type: 'Financial', date: '2026-05-10', status: 'Draft', size: '1.1 MB', author: 'NHP Division', downloads: 0, pages: 32 },
  { id: 'r11', title: 'NCD Screening Progress — Bo District', type: 'District', date: '2026-04-28', status: 'Published', size: '640 KB', author: 'A. Conteh', downloads: 34, pages: 14 },
  { id: 'r12', title: 'Community Health Worker Performance', type: 'HR', date: '2026-05-05', status: 'Under Review', size: '2.1 MB', author: 'CHW Programme', downloads: 5, pages: 28 },
];

const typeColors: Record<string, string> = {
  Quarterly: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10',
  Annual: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  District: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  Programme: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/10',
  Financial: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10',
  HR: 'bg-slate-100 text-slate-600',
  'Ad Hoc': 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/10',
};

const statusConfig: Record<Report['status'], { style: string; icon: React.ReactNode }> = {
  Published: { style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10', icon: <CheckCircle2 className="h-3 w-3" /> },
  Draft: { style: 'bg-slate-100 text-slate-600', icon: <FileText className="h-3 w-3" /> },
  'Under Review': { style: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10', icon: <Clock className="h-3 w-3" /> },
  Scheduled: { style: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/10', icon: <Calendar className="h-3 w-3" /> },
};

const reportTemplates = [
  { name: 'Quarterly Performance Report', description: 'Standard MoHS quarterly review with KPIs, budget execution, and activity progress.', icon: BarChart3 },
  { name: 'District Health Profile', description: 'Comprehensive district-level analysis with facility data and population metrics.', icon: PieChart },
  { name: 'Programme Performance', description: 'Programme-specific report with indicator tracking and outcome measures.', icon: TrendingUp },
  { name: 'Budget Execution Report', description: 'Financial report with expenditure analysis, variance reports, and procurement status.', icon: FileBarChart },
];

/* ──── Page ──── */

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  const types = ['All', 'Quarterly', 'Annual', 'District', 'Programme', 'Financial', 'HR'];
  const statuses = ['All', 'Published', 'Draft', 'Under Review', 'Scheduled'];

  const filteredReports = reports.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = selectedType === 'All' || r.type === selectedType;
    const matchStatus = selectedStatus === 'All' || r.status === selectedStatus;
    return matchSearch && matchType && matchStatus;
  });

  // KPIs
  const totalPublished = reports.filter(r => r.status === 'Published').length;
  const totalDownloads = reports.reduce((s, r) => s + r.downloads, 0);
  const avgPages = Math.round(reports.filter(r => r.pages > 0).reduce((s, r) => s + r.pages, 0) / reports.filter(r => r.pages > 0).length);
  const pendingReview = reports.filter(r => r.status === 'Under Review').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">Reports & Analytics</h1>
          <p className="text-muted mt-1">Generated reports, dashboards, and analytical summaries across all health programmes.</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-outline btn-sm">
            <Printer className="h-3.5 w-3.5" /> Print Queue
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="btn-primary btn-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Generate Report
          </button>
        </div>
      </header>

      {/* KPI Summary */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50">
            <FileText className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{totalPublished}</div>
            <div className="text-[11px] text-slate-500">Published Reports</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50">
            <Download className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{totalDownloads.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Total Downloads</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50">
            <BarChart3 className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{avgPages}</div>
            <div className="text-[11px] text-slate-500">Avg. Pages</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{pendingReview}</div>
            <div className="text-[11px] text-slate-500">Pending Review</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="card-flat p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === t
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input py-1.5 text-xs w-36"
          >
            {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
          </select>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <div>
            <h3 className="heading-section">Report Library</h3>
            <p className="text-xs text-slate-500 mt-0.5">{filteredReports.length} of {reports.length} reports shown</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th className="text-right">Downloads</th>
                <th className="text-right">Size</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50 border border-slate-100">
                        <FileText className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 text-sm truncate max-w-[280px]">{r.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">by {r.author} · {r.pages > 0 ? `${r.pages} pages` : 'Pending'}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`status-pill ${typeColors[r.type]}`}>{r.type}</span></td>
                  <td>
                    <span className={`status-pill inline-flex items-center gap-1 ${statusConfig[r.status].style}`}>
                      {statusConfig[r.status].icon}
                      {r.status}
                    </span>
                  </td>
                  <td className="text-sm text-slate-600 tabular-nums">{r.date}</td>
                  <td className="text-right">
                    {r.downloads > 0 ? (
                      <span className="tabular-nums text-sm font-medium text-slate-700">{r.downloads}</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="text-right text-sm tabular-nums text-slate-500">{r.size}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewReport(r)}
                        className="btn-ghost p-1.5 rounded-lg"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {r.status === 'Published' && (
                        <>
                          <button className="btn-ghost p-1.5 rounded-lg" title="Share">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button className="btn-ghost p-1.5 rounded-lg text-brand-700" title="Download">
                            <Download className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scheduled Reports Timeline */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <h3 className="heading-section">Upcoming Scheduled Reports</h3>
        </div>
        <div className="p-6">
          <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
            {[
              { title: 'Q2 2026 Performance Report', date: 'June 15, 2026', type: 'Quarterly', description: 'Auto-generated quarterly review covering April–June 2026.', color: 'bg-blue-500' },
              { title: 'Mid-Year Budget Execution', date: 'July 1, 2026', type: 'Financial', description: 'Comprehensive budget analysis at the fiscal year midpoint.', color: 'bg-rose-500' },
              { title: 'EPI Annual Coverage Report', date: 'July 15, 2026', type: 'Programme', description: 'Immunization coverage assessment across all 16 districts.', color: 'bg-violet-500' },
            ].map((item, idx) => (
              <div key={idx} className="relative pl-8">
                <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full ${item.color} border-2 border-white shadow-sm`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <span className={`status-pill text-[10px] ${typeColors[item.type]}`}>{item.type}</span>
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-2xl overflow-hidden animate-scale-in">
            <div className="section-header">
              <h3 className="heading-section">Generate New Report</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-slate-500">Select a report template to begin. The system will auto-populate data from the current fiscal year.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reportTemplates.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    className="card-flat p-5 text-left hover:shadow-card-hover hover:border-brand-200 transition-all group"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors">
                      <tmpl.icon className="h-5 w-5 text-brand-700" />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mt-3 group-hover:text-brand-700 transition-colors">{tmpl.name}</h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{tmpl.description}</p>
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label text-xs">Reporting Period</label>
                    <select className="input mt-1.5 text-sm">
                      <option>Q1 2026 (Jan–Mar)</option>
                      <option>Q2 2026 (Apr–Jun)</option>
                      <option>H1 2026 (Jan–Jun)</option>
                      <option>FY 2026 (Full Year)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Output Format</label>
                    <select className="input mt-1.5 text-sm">
                      <option>PDF Document</option>
                      <option>Excel Workbook (.xlsx)</option>
                      <option>PowerPoint (.pptx)</option>
                      <option>CSV Data Export</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowGenerateModal(false)} className="btn-ghost">Cancel</button>
                <button className="btn-primary font-bold">
                  <FileBarChart className="h-4 w-4" /> Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="section-header">
              <h3 className="heading-section">Report Preview</h3>
              <button
                onClick={() => setPreviewReport(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-50 border border-slate-100">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">{previewReport.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">by {previewReport.author}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Type</div>
                  <span className={`status-pill ${typeColors[previewReport.type]}`}>{previewReport.type}</span>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</div>
                  <span className={`status-pill inline-flex items-center gap-1 ${statusConfig[previewReport.status].style}`}>
                    {statusConfig[previewReport.status].icon}
                    {previewReport.status}
                  </span>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Date</div>
                  <div className="text-sm font-semibold text-slate-800 tabular-nums">{previewReport.date}</div>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Size</div>
                  <div className="text-sm font-semibold text-slate-800">{previewReport.size}</div>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Pages</div>
                  <div className="text-sm font-semibold text-slate-800 tabular-nums">{previewReport.pages || '—'}</div>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Downloads</div>
                  <div className="text-sm font-semibold text-slate-800 tabular-nums">{previewReport.downloads}</div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {previewReport.status === 'Published' && (
                  <>
                    <button className="btn-primary flex-1">
                      <Download className="h-4 w-4" /> Download
                    </button>
                    <button className="btn-outline flex-1">
                      <Share2 className="h-4 w-4" /> Share
                    </button>
                  </>
                )}
                <button onClick={() => setPreviewReport(null)} className="btn-ghost">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
