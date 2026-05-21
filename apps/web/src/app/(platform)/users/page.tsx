'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  Mail,
  Calendar,
  Search,
  MoreVertical,
  UserPlus,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Key,
  Edit,
  Trash2,
  Eye,
  X,
  AlertTriangle,
} from 'lucide-react';

/* ──── Mock Data ──── */

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Director' | 'Planner' | 'Finance' | 'M&E Officer' | 'Viewer' | 'API Client';
  directorate: string;
  lastLogin: string;
  status: 'Active' | 'Inactive' | 'Locked' | 'Pending';
  joinedDate: string;
  sessions: number;
  mfaEnabled: boolean;
}

const users: UserRecord[] = [
  { id: 'u1', name: 'Platform Admin', email: 'admin@nhpmbr.local', role: 'Super Admin', directorate: 'All', lastLogin: '2 hours ago', status: 'Active', joinedDate: '2024-01-15', sessions: 847, mfaEnabled: true },
  { id: 'u2', name: 'Dr. Alie Koroma', email: 'a.koroma@mohs.gov.sl', role: 'Director', directorate: 'DPPI', lastLogin: '1 day ago', status: 'Active', joinedDate: '2024-02-01', sessions: 421, mfaEnabled: true },
  { id: 'u3', name: 'Mohamed Sesay', email: 'm.sesay@mohs.gov.sl', role: 'Planner', directorate: 'MCH', lastLogin: '5 hours ago', status: 'Active', joinedDate: '2024-03-10', sessions: 286, mfaEnabled: false },
  { id: 'u4', name: 'Dr. Fatmata Bangura', email: 'f.bangura@mohs.gov.sl', role: 'Director', directorate: 'DDC', lastLogin: '3 hours ago', status: 'Active', joinedDate: '2024-02-15', sessions: 394, mfaEnabled: true },
  { id: 'u5', name: 'Francis Kamara', email: 'f.kamara@mohs.gov.sl', role: 'Finance', directorate: 'DHS', lastLogin: '1 day ago', status: 'Active', joinedDate: '2024-04-01', sessions: 178, mfaEnabled: false },
  { id: 'u6', name: 'Aminata Conteh', email: 'a.conteh@mohs.gov.sl', role: 'M&E Officer', directorate: 'NCD', lastLogin: '2 days ago', status: 'Active', joinedDate: '2024-05-20', sessions: 145, mfaEnabled: false },
  { id: 'u7', name: 'Ibrahim Turay', email: 'i.turay@mohs.gov.sl', role: 'Planner', directorate: 'EPI', lastLogin: '6 hours ago', status: 'Active', joinedDate: '2024-03-25', sessions: 312, mfaEnabled: true },
  { id: 'u8', name: 'Sarah Mansaray', email: 's.mansaray@mohs.gov.sl', role: 'Viewer', directorate: 'RCH', lastLogin: '1 week ago', status: 'Inactive', joinedDate: '2026-05-16', sessions: 4, mfaEnabled: false },
  { id: 'u9', name: 'Dr. James Kargbo', email: 'j.kargbo@mohs.gov.sl', role: 'Director', directorate: 'DPHA', lastLogin: '4 hours ago', status: 'Active', joinedDate: '2024-01-30', sessions: 502, mfaEnabled: true },
  { id: 'u10', name: 'Mariama Bangura', email: 'm.bangura@mohs.gov.sl', role: 'M&E Officer', directorate: 'EPI', lastLogin: '3 days ago', status: 'Active', joinedDate: '2024-06-15', sessions: 98, mfaEnabled: false },
  { id: 'u11', name: 'External API', email: 'api@dhis2.mohs.gov.sl', role: 'API Client', directorate: 'Integration', lastLogin: '1 hour ago', status: 'Active', joinedDate: '2024-07-01', sessions: 12400, mfaEnabled: false },
  { id: 'u12', name: 'John Koroma', email: 'j.koroma@mohs.gov.sl', role: 'Planner', directorate: 'HR', lastLogin: 'Never', status: 'Pending', joinedDate: '2026-05-20', sessions: 0, mfaEnabled: false },
];

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/10',
  'Director': 'bg-brand-50 text-brand-700 ring-1 ring-brand-600/10',
  'Planner': 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  'Finance': 'bg-gold-50 text-gold-700 ring-1 ring-gold-600/10',
  'M&E Officer': 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/10',
  'Viewer': 'bg-slate-100 text-slate-600',
  'API Client': 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/10',
};

const statusIcon: Record<UserRecord['status'], { icon: React.ComponentType<{ className?: string }>; color: string; dot: string }> = {
  Active: { icon: CheckCircle2, color: 'text-emerald-600', dot: 'bg-emerald-500' },
  Inactive: { icon: Clock, color: 'text-slate-400', dot: 'bg-slate-300' },
  Locked: { icon: XCircle, color: 'text-rose-600', dot: 'bg-rose-500' },
  Pending: { icon: Clock, color: 'text-amber-600', dot: 'bg-amber-500' },
};

/* ──── Page ──── */

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const roles = ['All', 'Super Admin', 'Director', 'Planner', 'Finance', 'M&E Officer', 'Viewer', 'API Client'];

  const filteredUsers = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.directorate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = selectedRole === 'All' || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  // Stats
  const activeCount = users.filter(u => u.status === 'Active').length;
  const mfaCount = users.filter(u => u.mfaEnabled).length;
  const directorCount = users.filter(u => u.role === 'Director').length;
  const totalSessions = users.reduce((s, u) => s + u.sessions, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">User Management</h1>
          <p className="text-muted mt-1">Manage platform users, roles, and access permissions across all directorates.</p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button className="btn-outline btn-sm">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary btn-sm"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite User
          </button>
        </div>
      </header>

      {/* User Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50">
            <Users className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{users.length}</div>
            <div className="text-[11px] text-slate-500">Total Users</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{activeCount}</div>
            <div className="text-[11px] text-slate-500">Active Users</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50">
            <Shield className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{mfaCount}</div>
            <div className="text-[11px] text-slate-500">MFA Enabled</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold-50">
            <Key className="h-5 w-5 text-gold-600" />
          </div>
          <div>
            <div className="text-xl font-bold tabular-nums text-slate-900">{totalSessions.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">Total Sessions</div>
          </div>
        </div>
      </section>

      {/* MFA Warning */}
      {mfaCount < users.filter(u => u.role !== 'Viewer' && u.role !== 'API Client').length && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">MFA Compliance Warning</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              {users.filter(u => u.role !== 'Viewer' && u.role !== 'API Client' && !u.mfaEnabled).length} users with elevated roles have not enabled Multi-Factor Authentication.
              MFA is required for Directors and above per platform security policy.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card-flat p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200">
        <div className="flex flex-wrap gap-1.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === r ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users, emails, directorates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="section-header">
          <div>
            <h3 className="heading-section">Platform Users</h3>
            <p className="text-xs text-slate-500 mt-0.5">{filteredUsers.length} users shown</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Directorate</th>
                <th>Status</th>
                <th>MFA</th>
                <th>Last Login</th>
                <th className="text-right">Sessions</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const st = statusIcon[u.status];
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-xs font-bold text-white shadow-sm">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-sm truncate">{u.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`status-pill ${roleColors[u.role] ?? 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                    <td>
                      <span className="text-sm text-slate-600 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        {u.directorate}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${st.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot} ${u.status === 'Active' ? 'animate-pulse-slow' : ''}`} />
                        {u.status}
                      </span>
                    </td>
                    <td>
                      {u.mfaEnabled ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <Shield className="h-3.5 w-3.5" /> On
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Off</span>
                      )}
                    </td>
                    <td className="text-sm text-slate-500">{u.lastLogin}</td>
                    <td className="text-right tabular-nums text-sm font-medium text-slate-700">{u.sessions.toLocaleString()}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="btn-ghost p-1.5 rounded-lg"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="btn-ghost p-1.5 rounded-lg" title="Edit user">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="section-header">
              <h3 className="heading-section">Invite New User</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs" htmlFor="inv-first">First Name</label>
                  <input id="inv-first" type="text" className="input mt-1.5" placeholder="e.g. Mohamed" />
                </div>
                <div>
                  <label className="label text-xs" htmlFor="inv-last">Last Name</label>
                  <input id="inv-last" type="text" className="input mt-1.5" placeholder="e.g. Sesay" />
                </div>
              </div>
              <div>
                <label className="label text-xs" htmlFor="inv-email">Email Address</label>
                <input id="inv-email" type="email" className="input mt-1.5" placeholder="user@mohs.gov.sl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs" htmlFor="inv-role">Role</label>
                  <select id="inv-role" className="input mt-1.5">
                    <option>Viewer</option>
                    <option>Planner</option>
                    <option>Finance</option>
                    <option>M&E Officer</option>
                    <option>Director</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs" htmlFor="inv-dir">Directorate</label>
                  <select id="inv-dir" className="input mt-1.5">
                    <option>DPPI</option>
                    <option>DPHA</option>
                    <option>DHS</option>
                    <option>RCH</option>
                    <option>DDC</option>
                    <option>EPI</option>
                    <option>MCH</option>
                    <option>NCD</option>
                    <option>HR</option>
                    <option>NHP</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" id="inv-mfa" className="rounded border-slate-300 text-brand-700 focus:ring-brand-500" />
                <label htmlFor="inv-mfa" className="text-sm text-slate-700">Require MFA enrollment on first login</label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn-ghost">Cancel</button>
                <button type="button" className="btn-primary font-bold">
                  <Mail className="h-4 w-4" /> Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md overflow-hidden animate-scale-in">
            <div className="section-header">
              <h3 className="heading-section">User Details</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-bold text-white shadow-md">
                  {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedUser.name}</h4>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Role</div>
                  <span className={`status-pill ${roleColors[selectedUser.role]}`}>{selectedUser.role}</span>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Directorate</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedUser.directorate}</div>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Status</div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusIcon[selectedUser.status].color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusIcon[selectedUser.status].dot}`} />
                    {selectedUser.status}
                  </span>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">MFA</div>
                  <div className="text-sm font-semibold text-slate-800">{selectedUser.mfaEnabled ? '✓ Enabled' : '✕ Disabled'}</div>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Joined</div>
                  <div className="text-sm font-semibold text-slate-800 tabular-nums">{selectedUser.joinedDate}</div>
                </div>
                <div className="card-flat p-3 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Sessions</div>
                  <div className="text-sm font-bold text-slate-800 tabular-nums">{selectedUser.sessions.toLocaleString()}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="btn-outline flex-1 text-xs">
                  <Key className="h-3.5 w-3.5" /> Reset Password
                </button>
                <button className="btn-outline flex-1 text-xs">
                  <Edit className="h-3.5 w-3.5" /> Edit Role
                </button>
                <button onClick={() => setSelectedUser(null)} className="btn-ghost text-xs">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
