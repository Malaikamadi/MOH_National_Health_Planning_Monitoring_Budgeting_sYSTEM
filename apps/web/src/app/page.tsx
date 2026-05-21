import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  Globe2,
  Layers,
  Shield,
  Activity,
  Users,
  FileCheck2,
  MapPin,
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Strategic Alignment',
    body: 'Every activity, budget line, and indicator traces back to a national strategic objective — automatically.',
  },
  {
    icon: ClipboardCheck,
    title: 'End-to-End Planning',
    body: 'Directorates draft, submit, review, and approve their Annual Work Plans entirely within the platform.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Intelligence',
    body: 'Executive, directorate, district and donor dashboards — refreshed continuously, drillable on every cell.',
  },
  {
    icon: Globe2,
    title: 'Offline-First Reporting',
    body: 'District and facility staff capture progress on devices that sync the moment connectivity returns.',
  },
  {
    icon: Shield,
    title: 'Government-Grade Security',
    body: 'Role-based access, MFA, audit logging, and data sovereignty — your data never leaves Sierra Leone.',
  },
  {
    icon: Activity,
    title: 'Indicator Tracking',
    body: '156+ health indicators tracked from baseline to target, with automated progress calculations.',
  },
];

const stats = [
  { value: '14', label: 'Directorates', icon: Users },
  { value: '16', label: 'Districts', icon: MapPin },
  { value: '156', label: 'Indicators', icon: BarChart3 },
  { value: '100%', label: 'Sovereign', icon: Shield },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-brand-700/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-64 w-64 rounded-full bg-gold-500/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          {/* Nav */}
          <header className="flex items-center justify-between px-6 py-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
                <img
                  src="/mohs-logo.png"
                  alt="MOHS"
                  className="h-9 w-9 rounded-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white">NHPMBR</div>
                <div className="text-[10px] text-white/50">Ministry of Health & Sanitation</div>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-white/20"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          {/* Hero content */}
          <div className="px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/80 ring-1 ring-white/20 mb-6">
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse-slow" />
                National Digital Infrastructure
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
                One platform for
                <span className="block text-accent-400">national health planning.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/70 max-w-2xl">
                NHPMBR unifies strategic plans, annual work plans, budgets, indicators and field
                reporting across every directorate, programme, district and facility — built for
                Sierra Leone&apos;s real-world infrastructure.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-brand-900 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign in to NHPMBR
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition-all hover:bg-white/20"
                >
                  <FileCheck2 className="h-4 w-4" />
                  Explore Dashboard
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:mt-20">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="rounded-xl bg-white/5 backdrop-blur-sm p-5 ring-1 ring-white/10">
                  <Icon className="h-5 w-5 text-white/40 mb-3" />
                  <div className="text-3xl font-bold text-white tabular-nums">{value}</div>
                  <div className="text-xs text-white/50 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Platform Capabilities</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Built for the Ministry. Designed for scale.
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Every module is crafted to meet the unique needs of Sierra Leone&apos;s national health system,
              from Freetown to the most remote PHU.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-xl border border-slate-200/80 bg-white p-6 shadow-card transition-all hover:shadow-card-hover hover:border-brand-200"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 group-hover:bg-brand-100 transition-colors">
                  <Icon className="h-6 w-6 text-brand-600" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-900 to-brand-800 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to modernize health planning?
          </h2>
          <p className="mt-4 text-base text-white/70">
            Join the directorates already using NHPMBR for annual work plan management.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-brand-900 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-slate-500 md:flex-row md:items-center lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-700">
              <span className="text-[9px] font-bold text-white">MOH</span>
            </div>
            <div>
              <span className="block font-medium text-slate-700">Ministry of Health & Sanitation</span>
              <span>Government of Sierra Leone · © {new Date().getFullYear()}</span>
            </div>
          </div>
          <span className="text-slate-400">NHPMBR v0.1.0 · National Digital Infrastructure</span>
        </div>
      </footer>
    </main>
  );
}
