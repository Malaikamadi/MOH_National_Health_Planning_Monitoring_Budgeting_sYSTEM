import { Settings, Database, Shield, Globe, Server, Bell, Key, HardDrive } from 'lucide-react';

export const metadata = { title: 'Platform Settings' };

const settingSections = [
  {
    title: 'General',
    icon: Settings,
    items: [
      { label: 'Platform Name', value: 'NHPMBR — National Health Planning Platform', editable: true },
      { label: 'Default Language', value: 'English (en)', editable: true },
      { label: 'Fiscal Year Start', value: 'January 1', editable: true },
      { label: 'Currency', value: 'Sierra Leonean Leone (SLL)', editable: false },
    ],
  },
  {
    title: 'Security & Authentication',
    icon: Shield,
    items: [
      { label: 'Identity Provider', value: 'Keycloak (OIDC)', editable: false },
      { label: 'MFA Policy', value: 'Required for Directors and above', editable: true },
      { label: 'Session Timeout', value: '8 hours', editable: true },
      { label: 'Password Policy', value: 'Min 12 chars, uppercase, number, special', editable: true },
    ],
  },
  {
    title: 'Data & Storage',
    icon: Database,
    items: [
      { label: 'Database', value: 'PostgreSQL 16 (asyncpg)', editable: false },
      { label: 'Object Storage', value: 'MinIO (S3-compatible)', editable: false },
      { label: 'Backup Schedule', value: 'Daily at 02:00 UTC', editable: true },
      { label: 'Data Retention', value: '7 years (per MOH policy)', editable: true },
    ],
  },
  {
    title: 'API & Integrations',
    icon: Globe,
    items: [
      { label: 'API Base URL', value: 'http://localhost:8000', editable: true },
      { label: 'DHIS2 Integration', value: 'Not configured', editable: true },
      { label: 'OpenHIM Mediator', value: 'Not configured', editable: true },
      { label: 'CORS Origins', value: 'http://localhost:3000', editable: true },
    ],
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="heading-page">Platform Settings</h1>
        <p className="text-muted mt-1">System configuration, security policies, and integration settings.</p>
      </header>

      {/* System Health */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <HealthCard icon={Server} label="API Server" status="Healthy" color="emerald" />
        <HealthCard icon={Database} label="Database" status="Connected" color="emerald" />
        <HealthCard icon={HardDrive} label="Storage" status="72% used" color="amber" />
        <HealthCard icon={Key} label="Auth (Keycloak)" status="Connected" color="emerald" />
      </section>

      {/* Settings Sections */}
      {settingSections.map((section) => (
        <section key={section.title} className="card overflow-hidden">
          <div className="section-header">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50">
                <section.icon className="h-4.5 w-4.5 text-brand-600" />
              </div>
              <h3 className="heading-section">{section.title}</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                <div>
                  <div className="text-sm font-medium text-slate-800">{item.label}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">{item.value}</span>
                  {item.editable && (
                    <button className="text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors">
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Version Info */}
      <div className="card-flat p-5 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          NHPMBR v0.1.0 · Built for the Ministry of Health and Sanitation, Government of Sierra Leone
        </div>
        <span className="badge-green">MVP</span>
      </div>
    </div>
  );
}

function HealthCard({
  icon: Icon,
  label,
  status,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  status: string;
  color: 'emerald' | 'amber' | 'rose';
}) {
  const colors = {
    emerald: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    amber: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    rose: { dot: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
  };
  const c = colors[color];

  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${c.bg}`}>
        <Icon className={`h-5 w-5 ${c.text}`} />
      </div>
      <div>
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-pulse-slow`} />
          <span className={`text-sm font-semibold ${c.text}`}>{status}</span>
        </div>
      </div>
    </div>
  );
}
