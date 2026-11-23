'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Search,
  Plus,
  Shield,
  UserCheck,
  UserX,
  Building,
  Phone,
  Mail,
  Lock,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function UserManagementPage() {
  const { users, departments, addUser, updateUser, addToast } = useCivicPulse();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('CITIZEN');
  const [newUserDeptId, setNewUserDeptId] = useState(departments[0]?.id || 'dept-roads');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserZone, setNewUserZone] = useState('Sector 4 - Downtown');

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const handleToggleStatus = (u: User) => {
    const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateUser(u.id, { status: nextStatus });
    addToast('User Status Updated', `${u.name} set to ${nextStatus}.`, 'INFO');
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone || '+1 (555) 019-1234',
      role: newUserRole,
      departmentId: newUserRole === 'DEPARTMENT_MANAGER' || newUserRole === 'MAINTENANCE_STAFF' ? newUserDeptId : undefined,
      assignedZone: newUserZone,
      status: 'ACTIVE',
      activeTasks: 0,
      completedTasksCount: 0,
    });

    addToast('Account Created', `User ${newUserName} (${newUserRole}) added to directory.`, 'SUCCESS');
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'DEPARTMENT_MANAGER':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'MAINTENANCE_STAFF':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'CITIZEN':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Municipal Identity & Access Management (IAM)
              </h1>
              <span className="text-xs bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                {users.length} Users
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Role-based access control, departmental assignments, and administrative permission governance.
            </p>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-sky-600/20 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email, or role..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'ADMIN', 'DEPARTMENT_MANAGER', 'MAINTENANCE_STAFF', 'CITIZEN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-sky-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Jurisdiction</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const dept = departments.find((d) => d.id === u.departmentId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {u.name}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(u.role)}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {dept ? dept.name : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {u.assignedZone}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                            u.status === 'ACTIVE'
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900 dark:hover:bg-emerald-950'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create User Modal */}
        {isAddUserOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Add User Account
                </h3>
                <button
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Rachel Adams"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="rachel@civicpulse.gov"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="CITIZEN">Citizen</option>
                      <option value="MAINTENANCE_STAFF">Maintenance Staff</option>
                      <option value="DEPARTMENT_MANAGER">Department Manager</option>
                      <option value="ADMIN">System Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                    <select
                      value={newUserDeptId}
                      onChange={(e) => setNewUserDeptId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned City Sector</label>
                  <select
                    value={newUserZone}
                    onChange={(e) => setNewUserZone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Sector 1 - Civic Center">Sector 1 - Civic Center</option>
                    <option value="Sector 2 - East Meadow">Sector 2 - East Meadow</option>
                    <option value="Sector 3 - Medical Corridor">Sector 3 - Medical Corridor</option>
                    <option value="Sector 4 - Downtown">Sector 4 - Downtown</option>
                    <option value="Sector 5 - Transit Hub">Sector 5 - Transit Hub</option>
                    <option value="Sector 6 - University Quarter">Sector 6 - University Quarter</option>
                    <option value="Sector 7 - Waterfront">Sector 7 - Waterfront</option>
                    <option value="Sector 8 - Industrial Park">Sector 8 - Industrial Park</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl mt-3 transition"
                >
                  Create User
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
