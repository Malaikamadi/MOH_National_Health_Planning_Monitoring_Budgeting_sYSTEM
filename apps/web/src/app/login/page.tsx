import Link from 'next/link';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Sign In' };

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-700/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
              <img
                src="/mohs-logo.png"
                alt="MOHS"
                className="h-10 w-10 rounded-full object-cover"
              />
            </div>
            <div>
              <div className="text-base font-bold">NHPMBR</div>
              <div className="text-xs text-white/60">Ministry of Health & Sanitation</div>
            </div>
          </div>

          <h1 className="text-3xl font-bold leading-tight max-w-md">
            National Health Planning, Monitoring & Reporting Platform
          </h1>
          <p className="mt-4 text-base text-white/70 max-w-md leading-relaxed">
            One unified platform for strategic plans, annual work plans, budgets, indicators
            and field reporting — built for Sierra Leone&apos;s Ministry of Health.
          </p>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-white/40">
          <span>Government of Sierra Leone</span>
          <span>·</span>
          <span>Sovereign infrastructure</span>
          <span>·</span>
          <span>v0.1.0</span>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex items-center justify-center p-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-700 to-brand-950 shadow-sm">
              <img
                src="/mohs-logo.png"
                alt="MOHS"
                className="h-9 w-9 rounded-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-bold text-brand-900">NHPMBR</div>
              <div className="text-[10px] text-slate-400">Ministry of Health & Sanitation</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to the National Health Planning Platform.
            </p>
          </div>

          {/* SSO Button */}
          <div className="space-y-4">
            <Link
              href="/dashboard"
              className="btn-primary w-full justify-center py-3"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
              Continue with Ministry SSO
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400">or sign in with credentials</span>
              </div>
            </div>

            {/* Credential form (for dev) */}
            <div className="space-y-3">
              <div>
                <label className="label text-xs" htmlFor="email">Email address</label>
                <input id="email" type="email" className="input mt-1" placeholder="admin@nhpmbr.local" defaultValue="admin@nhpmbr.local" />
              </div>
              <div>
                <label className="label text-xs" htmlFor="password">Password</label>
                <input id="password" type="password" className="input mt-1" placeholder="••••••••••" defaultValue="Admin123!Change" />
              </div>
              <Link href="/dashboard" className="btn-outline w-full justify-center">
                <Lock className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>

          {/* Dev tip */}
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-800">
            <strong>Dev mode:</strong> Use{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">admin@nhpmbr.local</code> /{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[11px]">Admin123!Change</code>
          </div>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Protected by government-grade security · Data sovereignty compliant
          </p>
        </div>
      </div>
    </main>
  );
}
