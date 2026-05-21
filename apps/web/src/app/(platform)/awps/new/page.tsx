import Link from 'next/link';

export const metadata = { title: 'Create AWP' };

export default function NewAwpPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <Link href="/awps" className="text-xs font-semibold text-brand-700 hover:text-brand-800 mb-3 inline-flex items-center gap-1">
          ← Back to Annual Work Plans
        </Link>
        <h1 className="heading-page">Create New AWP</h1>
        <p className="text-muted mt-1">Initialize a new Annual Work Plan for a directorate.</p>
      </header>

      <div className="card max-w-2xl">
        <div className="p-6 space-y-5">
          <div>
            <label className="label" htmlFor="fy">Fiscal Year</label>
            <select id="fy" className="input mt-1.5">
              <option>FY 2026</option>
              <option>FY 2027</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dir">Directorate</label>
            <select id="dir" className="input mt-1.5">
              <option value="">Select directorate...</option>
              <option>Policy, Planning & Information (DPPI)</option>
              <option>Primary Health Care Administration (DPHA)</option>
              <option>Hospital Services (DHS)</option>
              <option>Reproductive & Child Health (RCH)</option>
              <option>Disease Prevention & Control (DDC)</option>
              <option>Epidemiology & Surveillance (EPI)</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="notes">Notes (optional)</label>
            <textarea id="notes" rows={3} className="input mt-1.5" placeholder="Any initial notes for this work plan..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary">Create AWP</button>
            <Link href="/awps" className="btn-ghost">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
