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
import { MinistryLogo, MinistryWordmark } from '@/components/brand/ministry-logo';

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
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(26,181,99,0.12)_0%,_transparent_55%)]" />
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-700/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent-600 via-gold-400 to-accent-600" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <header className="flex items-center justify-between py-6 lg:py-8">
            <div className="flex items-center gap-4">
              <MinistryLogo size="md" priority showSealRing />
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white">NHPMBR</p>
                <p className="text-[11px] text-white/55">National Health Platform</p>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid items-center gap-12 pb-16 pt-6 lg:grid-cols-2 lg:gap-16 lg:pb-24 lg:pt-10">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/85 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-accent-400 animate-pulse-slow" />
                Government of Sierra Leone
              </div>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                One platform for{' '}
                <span className="text-accent-300">national health planning</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                NHPMBR unifies strategic plans, annual work plans, budgets, indicators and field
                reporting across every directorate, programme, district and facility.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand-900 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  Sign in to NHPMBR
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  <FileCheck2 className="h-4 w-4" />
                  Explore dashboard
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(({ value, label, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <Icon className="mb-2 h-4 w-4 text-accent-300/80" />
                    <div className="text-2xl font-bold tabular-nums text-white">{value}</div>
                    <div className="text-[11px] text-white/50">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 flex flex-col items-center justify-center lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 scale-110 rounded-full bg-accent-500/20 blur-3xl" />
                <MinistryLogo
                  size="showcase"
                  priority
                  showSealRing
                  className="relative shadow-2xl ring-offset-brand-900"
                />
              </div>
              <div className="mt-8 text-center lg:max-w-sm">
                <MinistryWordmark
                  variant="light"
                  subtitle="Ministry of Health & Sanitation"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200/80 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-16 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Platform capabilities
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Built for the Ministry. Designed for scale.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Every module meets the needs of Sierra Leone&apos;s national health system, from
              Freetown to the most remote PHU.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-all hover:border-accent-200 hover:shadow-card-hover"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 transition-colors group-hover:bg-accent-50">
                  <Icon className="h-6 w-6 text-brand-700 group-hover:text-accent-700" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <MinistryLogo size="lg" className="mx-auto mb-8 ring-offset-brand-900" />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to modernize health planning?
          </h2>
          <p className="mt-4 text-base text-white/70">
            Join directorates using NHPMBR for annual work plan management and national reporting.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-900 shadow-lg transition-all hover:scale-[1.02]"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center lg:px-10">
          <div className="flex items-center gap-5">
            <MinistryLogo size="md" showSealRing />
            <div>
              <p className="font-semibold text-slate-800">Ministry of Health</p>
              <p className="text-sm text-slate-500">Government of Sierra Leone · © {new Date().getFullYear()}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">NHPMBR v0.1.0 · National Digital Infrastructure</p>
        </div>
      </footer>
    </main>
  );
}
