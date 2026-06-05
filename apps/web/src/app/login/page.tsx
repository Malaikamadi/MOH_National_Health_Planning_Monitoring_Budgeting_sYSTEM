'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Crown,
  Building2,
  UserCircle2,
  ChevronRight,
} from 'lucide-react';
import { MinistryLogo, MinistryWordmark } from '@/components/brand/ministry-logo';
import { signInWithKeycloak } from './actions';
import { type AuthUser, type UserRole, getDashboardRoute } from '@/lib/auth-context';

/* ──── Mock directorate / unit data for dev login ──── */

const directorateOptions = [
  { code: 'DPPI', name: 'Directorate of Policy, Planning & Information', director: 'Dr. Alie Koroma', email: 'a.koroma@mohs.gov.sl' },
  { code: 'DPHC', name: 'Directorate of Primary Health Care', director: 'Dr. Fatmata Bangura', email: 'f.bangura@mohs.gov.sl' },
  { code: 'DPC', name: 'Directorate of Disease Prevention & Control', director: 'Dr. James Kargbo', email: 'j.kargbo@mohs.gov.sl' },
  { code: 'DHS', name: 'Directorate of Hospital Services', director: 'Dr. Mohamed Sesay', email: 'm.sesay@mohs.gov.sl' },
  { code: 'DHRH', name: 'Directorate of Human Resources for Health', director: 'Dr. Ibrahim Turay', email: 'i.turay@mohs.gov.sl' },
];

const unitsByDirectorate: Record<string, { name: string; email: string }[]> = {
  DPPI: [
    { name: 'M&E Unit', email: 'me.unit@mohs.gov.sl' },
    { name: 'Planning Unit', email: 'planning.unit@mohs.gov.sl' },
    { name: 'HMIS Unit', email: 'hmis.unit@mohs.gov.sl' },
  ],
  DPHC: [
    { name: 'EPI Unit', email: 'epi.unit@mohs.gov.sl' },
    { name: 'Nutrition Unit', email: 'nutrition.unit@mohs.gov.sl' },
    { name: 'CHW Programme', email: 'chw.unit@mohs.gov.sl' },
    { name: 'RH Unit', email: 'rh.unit@mohs.gov.sl' },
  ],
  DPC: [
    { name: 'Surveillance Unit', email: 'surveillance.unit@mohs.gov.sl' },
    { name: 'Laboratory Unit', email: 'lab.unit@mohs.gov.sl' },
    { name: 'Malaria Unit', email: 'malaria.unit@mohs.gov.sl' },
  ],
  DHS: [
    { name: 'Pharmacy Unit', email: 'pharmacy.unit@mohs.gov.sl' },
    { name: 'NCD Unit', email: 'ncd.unit@mohs.gov.sl' },
    { name: 'Mental Health Unit', email: 'mentalhealth.unit@mohs.gov.sl' },
  ],
  DHRH: [
    { name: 'Training Unit', email: 'training.unit@mohs.gov.sl' },
    { name: 'Deployment & Staffing', email: 'deployment.unit@mohs.gov.sl' },
  ],
};

/* ──── Tab Config ──── */

type RoleTab = {
  role: UserRole;
  label: string;
  icon: typeof Crown;
  description: string;
  gradient: string;
  activeRing: string;
};

const tabs: RoleTab[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    icon: Crown,
    description: 'CMO & Leadership',
    gradient: 'from-amber-500 to-amber-700',
    activeRing: 'ring-amber-500/50',
  },
  {
    role: 'admin',
    label: 'Director',
    icon: Building2,
    description: 'Directorate Head',
    gradient: 'from-accent-600 to-accent-800',
    activeRing: 'ring-accent-500/50',
  },
  {
    role: 'user',
    label: 'Unit',
    icon: UserCircle2,
    description: 'Programme / Unit',
    gradient: 'from-blue-600 to-blue-800',
    activeRing: 'ring-blue-500/50',
  },
];

/* ──── Page ──── */

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<UserRole>('super_admin');
  const [selectedDir, setSelectedDir] = useState(directorateOptions[0]?.code ?? 'DPPI');
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const router = useRouter();

  const currentTab = tabs.find((t) => t.role === activeTab)!;

  function handleDevLogin() {
    let profile: AuthUser;

    if (activeTab === 'super_admin') {
      profile = {
        role: 'super_admin',
        name: 'Dr. Austin Demby',
        email: 'cmo@mohs.gov.sl',
      };
    } else if (activeTab === 'admin') {
      const dir = directorateOptions.find((d) => d.code === selectedDir)!;
      profile = {
        role: 'admin',
        name: dir.director,
        email: dir.email,
        directorate: dir.name,
        directorateCode: dir.code,
      };
    } else {
      const dir = directorateOptions.find((d) => d.code === selectedDir)!;
      const units = unitsByDirectorate[selectedDir] ?? [];
      const unit = units[selectedUnitIdx] ?? units[0];
      profile = {
        role: 'user',
        name: unit.name,
        email: unit.email,
        directorate: dir.name,
        directorateCode: dir.code,
        unitName: unit.name,
      };
    }

    // Store in localStorage for AuthProvider to pick up
    localStorage.setItem('nhpmbr_dev_auth', JSON.stringify(profile));
    router.push(getDashboardRoute(activeTab));
  }

  const dirUnits = unitsByDirectorate[selectedDir] ?? [];

  return (
    <main className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left — Ministry brand */}
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

      {/* Right — Role-based sign in */}
      <div className="flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 p-8">
        <div className="w-full max-w-md">
          <div className="mb-10 flex flex-col items-center gap-4 lg:hidden">
            <MinistryLogo size="xl" priority />
            <MinistryWordmark className="text-center" />
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-card">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">
                Select your account type to access NHPMBR.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="mb-6 grid grid-cols-3 gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.role;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.role}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.role);
                      setSelectedUnitIdx(0);
                    }}
                    className={`group relative flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3.5 text-center transition-all duration-200 ${
                      isActive
                        ? `border-transparent bg-gradient-to-br ${tab.gradient} text-white shadow-lg ring-2 ${tab.activeRing} scale-[1.02]`
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="text-xs font-bold">{tab.label}</span>
                    <span className={`text-[9px] leading-tight ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {tab.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Role-specific info bar */}
            <div className={`mb-5 flex items-center gap-3 rounded-lg p-3 ${
              activeTab === 'super_admin'
                ? 'bg-amber-50 border border-amber-200/60'
                : activeTab === 'admin'
                  ? 'bg-accent-50 border border-accent-200/60'
                  : 'bg-blue-50 border border-blue-200/60'
            }`}>
              <currentTab.icon className={`h-5 w-5 shrink-0 ${
                activeTab === 'super_admin' ? 'text-amber-600' :
                activeTab === 'admin' ? 'text-accent-600' : 'text-blue-600'
              }`} />
              <div className="min-w-0">
                <p className={`text-xs font-bold ${
                  activeTab === 'super_admin' ? 'text-amber-800' :
                  activeTab === 'admin' ? 'text-accent-800' : 'text-blue-800'
                }`}>
                  {activeTab === 'super_admin' && 'CMO, Deputy CMO & Department Heads'}
                  {activeTab === 'admin' && 'Directorate Directors — oversee their units'}
                  {activeTab === 'user' && 'Unit accounts — submit AWPs & track activities'}
                </p>
                <p className={`text-[10px] mt-0.5 ${
                  activeTab === 'super_admin' ? 'text-amber-600' :
                  activeTab === 'admin' ? 'text-accent-600' : 'text-blue-600'
                }`}>
                  {activeTab === 'super_admin' && 'Full access to all directorates, users, and settings'}
                  {activeTab === 'admin' && 'View and manage units within your directorate'}
                  {activeTab === 'user' && 'Access your unit dashboard, AWP, and reports'}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Keycloak SSO */}
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

              {/* Dev bypass fields */}
              <div className="space-y-3">
                {/* Directorate selector — shown for admin & user */}
                {(activeTab === 'admin' || activeTab === 'user') && (
                  <div>
                    <label className="label text-xs" htmlFor="dev-directorate">
                      Directorate
                    </label>
                    <select
                      id="dev-directorate"
                      className="input mt-1"
                      value={selectedDir}
                      onChange={(e) => {
                        setSelectedDir(e.target.value);
                        setSelectedUnitIdx(0);
                      }}
                    >
                      {directorateOptions.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} — {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Unit selector — shown for user only */}
                {activeTab === 'user' && (
                  <div>
                    <label className="label text-xs" htmlFor="dev-unit">
                      Unit
                    </label>
                    <select
                      id="dev-unit"
                      className="input mt-1"
                      value={selectedUnitIdx}
                      onChange={(e) => setSelectedUnitIdx(Number(e.target.value))}
                    >
                      {dirUnits.map((u, i) => (
                        <option key={u.email} value={i}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Super admin info */}
                {activeTab === 'super_admin' && (
                  <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-xs font-bold text-white shadow-sm">
                        AD
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Dr. Austin Demby</p>
                        <p className="text-[11px] text-slate-500">Chief Medical Officer · cmo@mohs.gov.sl</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Director info — shown for admin */}
                {activeTab === 'admin' && (() => {
                  const dir = directorateOptions.find((d) => d.code === selectedDir)!;
                  return (
                    <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-600 to-accent-800 text-xs font-bold text-white shadow-sm">
                          {dir.director.split(' ').pop()?.[0] ?? 'D'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{dir.director}</p>
                          <p className="text-[11px] text-slate-500">Director · {dir.email}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Unit info — shown for user */}
                {activeTab === 'user' && dirUnits[selectedUnitIdx] && (
                  <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-xs font-bold text-white shadow-sm">
                        {dirUnits[selectedUnitIdx].name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{dirUnits[selectedUnitIdx].name}</p>
                        <p className="text-[11px] text-slate-500">{selectedDir} · {dirUnits[selectedUnitIdx].email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDevLogin}
                  className={`w-full justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === 'super_admin'
                      ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : activeTab === 'admin'
                        ? 'border-accent-300 bg-accent-50 text-accent-800 hover:bg-accent-100'
                        : 'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  Continue as {currentTab.label} (dev)
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
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
