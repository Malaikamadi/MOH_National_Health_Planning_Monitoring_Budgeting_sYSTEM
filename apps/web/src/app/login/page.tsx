import Link from 'next/link';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { MinistryLogo, MinistryWordmark } from '@/components/brand/ministry-logo';
import { signInWithKeycloak } from './actions';

export const metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left — Ministry brand (logo-first) */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 px-8 py-10 lg:px-14 lg:py-12 text-white">
        <div className="absolute -top-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-80" />

        <div className="relative flex flex-1 flex-col items-center justify-center text-center lg:items-start lg:text-left">
          <MinistryLogo size="showcase" priority showSealRing className="mx-auto lg:mx-0 shadow-2xl" />
          <div className="mt-10 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-300">
              Republic of Sierra Leone
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl lg:text-[2rem]">
              National Health Planning, Monitoring &amp; Reporting Platform
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
              Secure access for Ministry directorates, districts, and programmes — strategic
              plans, annual work plans, budgets, and national health indicators in one system.
            </p>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-white/45 lg:justify-start">
          <span>Ministry of Health</span>
          <span aria-hidden>·</span>
          <span>Government of Sierra Leone</span>
          <span aria-hidden>·</span>
          <span>NHPMBR v0.1.0</span>
        </div>
      </div>

      {/* Right — Sign in */}
      <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center gap-4 lg:hidden">
            <MinistryLogo size="xl" priority />
            <MinistryWordmark className="text-center" />
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-card">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">
                Use your Ministry identity account to access NHPMBR.
              </p>
            </div>

            <div className="space-y-5">
              <form action={signInWithKeycloak}>
                <button type="submit" className="btn-primary w-full justify-center py-3.5">
                  <ShieldCheck className="h-5 w-5" />
                  Continue with Ministry SSO
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-slate-400">Development sign-in</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label text-xs" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input mt-1"
                    placeholder="admin@nhpmbr.local"
                    defaultValue="admin@nhpmbr.local"
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="label text-xs" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="input mt-1"
                    placeholder="••••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <Link href="/dashboard" className="btn-outline w-full justify-center">
                  <Lock className="h-4 w-4" />
                  Continue (dev bypass)
                </Link>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-400">
              Protected by role-based access, audit logging, and national data sovereignty
              standards.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
