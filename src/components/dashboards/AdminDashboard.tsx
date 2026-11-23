'use client';

import React, { useState } from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { Issue, Department, User, IssuePriority, IssueStatus, IssueCategory, UserRole } from '../../types';
import {
  Shield,
  Building,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Power,
  BarChart3,
  Sliders,
  Search,
  Filter,
  DollarSign,
  FileSpreadsheet,
  MapPin,
  ExternalLink,
  Wrench,
  KeyRound,
} from 'lucide-react';
import {
  formatDate,
  formatTimeAgo,
  getPriorityStyles,
  getStatusStyles,
  getCategoryLabel,
  getSlaRemaining,
} from '../../lib/utils';
import { InteractiveMap } from '../InteractiveMap';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

interface AdminDashboardProps {
  onSelectIssue: (issue: Issue) => void;
  onOpenReportModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectIssue,
  onOpenReportModal,
}) => {
  const {
    issues,
    departments,
    users,
    systemConfig,
    updateSystemConfig,
    addDepartment,
    updateDepartment,
    toggleDepartmentStatus,
    addUser,
    updateUser,
    deleteUser,
  } = useCivicPulse();

  const [activeTab, setActiveTab] = useState<'analytics' | 'map' | 'issues' | 'departments' | 'users' | 'config'>('analytics');
  
  // Issue search & filter
  const [issueSearch, setIssueSearch] = useState('');
  const [issueStatusFilter, setIssueStatusFilter] = useState<string>('ALL');
  const [issueDeptFilter, setIssueDeptFilter] = useState<string>('ALL');

  // New Department Form State
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState<'ROADS' | 'LIGHTING' | 'WATER' | 'FOOTPATHS' | 'WASTE' | 'PUBLIC_INFRA'>('ROADS');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  const [deptBudget, setDeptBudget] = useState(1500000);
  const [selectedHeadManager, setSelectedHeadManager] = useState(users.find(u => u.role === 'DEPARTMENT_MANAGER')?.id || '');

  // New User Form State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+1 (555) 000-0000');
  const [newUserRole, setNewUserRole] = useState<UserRole>('MAINTENANCE_STAFF');
  const [newUserDeptId, setNewUserDeptId] = useState(departments[0]?.id || '');
  const [newUserZone, setNewUserZone] = useState('Sector 4 - Downtown');

  // Filtered issues
  const filteredIssues = issues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(issueSearch.toLowerCase()) ||
      i.id.toLowerCase().includes(issueSearch.toLowerCase()) ||
      i.location.address.toLowerCase().includes(issueSearch.toLowerCase());
    const matchesStatus = issueStatusFilter === 'ALL' || i.status === issueStatusFilter;
    const matchesDept = issueDeptFilter === 'ALL' || i.departmentId === issueDeptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const mgr = users.find((u) => u.id === selectedHeadManager) || users[0];
    addDepartment({
      name: deptName,
      code: deptCode,
      description: deptDesc,
      icon: 'Building',
      color: 'blue',
      headManagerId: mgr.id,
      headManagerName: mgr.name,
      contactEmail: deptEmail,
      contactPhone: '+1 (555) 301-4499',
      budgetAllocated: Number(deptBudget),
      status: 'ACTIVE',
      slaHours: {
        LOW: 48,
        MEDIUM: 24,
        HIGH: 12,
        CRITICAL: 4,
      },
    });
    setIsAddDeptOpen(false);
    setDeptName('');
    setDeptDesc('');
    setDeptEmail('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      role: newUserRole,
      departmentId: newUserRole === 'DEPARTMENT_MANAGER' || newUserRole === 'MAINTENANCE_STAFF' ? newUserDeptId : undefined,
      assignedZone: newUserZone,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=256&q=80`,
      activeTasks: 0,
      completedTasksCount: 0,
      status: 'ACTIVE',
    });
    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              City Central Command
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Smart City Infrastructure Executive Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            System-level control of smart city departments, incident triaging, service-level compliance, and workforce dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Log Incident
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Sliders className="w-4 h-4" /> Configurations
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex flex-wrap gap-1">
        {[
          { id: 'analytics', label: 'Analytics Dashboard (Charts)', icon: BarChart3 },
          { id: 'map', label: 'GIS Incident Telemetry Map', icon: MapPin },
          { id: 'issues', label: `All Reported Issues (${issues.length})`, icon: AlertTriangle },
          { id: 'departments', label: `Departments Management (${departments.length})`, icon: Building },
          { id: 'users', label: `Team Members & Roles (${users.length})`, icon: Users },
          { id: 'config', label: 'System Configurations', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD WITH RECHARTS */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard />
      )}

      {/* TAB 2: GIS MAP */}
      {activeTab === 'map' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                Live Metropolitan GIS Infrastructure Telemetry
              </h3>
              <p className="text-xs text-slate-500">
                Filter by department, category, or sector to inspect location-wise issue distribution
              </p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              SATELLITE SYNC ACTIVE
            </span>
          </div>
          <InteractiveMap
            issues={issues}
            onIssueClick={(i) => onSelectIssue(i)}
            height="440px"
          />
        </div>
      )}

      {/* TAB 3: ALL REPORTED ISSUES (FILTER, SEARCH, MONITOR) */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={issueSearch}
                onChange={(e) => setIssueSearch(e.target.value)}
                placeholder="Search by ID, title, address, or reporter..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={issueStatusFilter}
                onChange={(e) => setIssueStatusFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={issueDeptFilter}
                onChange={(e) => setIssueDeptFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No infrastructure issues matched your filter criteria.
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const pStyles = getPriorityStyles(issue.priority);
                const sStyles = getStatusStyles(issue.status);
                const sla = getSlaRemaining(issue.slaDeadline, issue.status);

                return (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
                        {issue.photoUrls.length > 0 ? (
                          <img src={issue.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-[10px]">No img</div>
                        )}
                        <span className={`absolute bottom-0 inset-x-0 h-1 ${pStyles.solid}`} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.2 rounded border border-sky-200">
                            {issue.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${pStyles.badge}`}>
                            {issue.priority}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${sStyles.badge}`}>
                            {sStyles.label}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {getCategoryLabel(issue.category)}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 truncate">{issue.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{issue.location.address} ({issue.location.cityZone})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className={`text-[11px] font-semibold flex items-center gap-1 justify-end ${
                          sla.isBreached ? 'text-rose-600' : 'text-slate-600'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {sla.text}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Reporter: {issue.citizenName}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue(issue);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Inspect →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DEPARTMENTS MANAGEMENT (CREATE, UPDATE, DEACTIVATE) */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Municipal Departments</h3>
              <p className="text-xs text-slate-500">
                Configure administrative jurisdictions, budgets, manager leads, and target SLA thresholds
              </p>
            </div>
            <button
              onClick={() => setIsAddDeptOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          {/* Add Department Form Modal */}
          {isAddDeptOpen && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold">Register New Municipal Department</h4>
                <button onClick={() => setIsAddDeptOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Department Name:</label>
                    <input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Bridges & Urban Structural Engineering"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Jurisdiction Code:</label>
                    <select
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="ROADS">ROADS</option>
                      <option value="LIGHTING">LIGHTING</option>
                      <option value="WATER">WATER</option>
                      <option value="FOOTPATHS">FOOTPATHS</option>
                      <option value="WASTE">WASTE</option>
                      <option value="PUBLIC_INFRA">PUBLIC_INFRA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Appointed Head Manager:</label>
                    <select
                      value={selectedHeadManager}
                      onChange={(e) => setSelectedHeadManager(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      {users.filter(u => u.role === 'DEPARTMENT_MANAGER' || u.role === 'ADMIN').map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Official Contact Email:</label>
                    <input
                      type="email"
                      value={deptEmail}
                      onChange={(e) => setDeptEmail(e.target.value)}
                      placeholder="engineering@civicpulse.gov"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-300 block mb-1">Charter Description:</label>
                  <textarea
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    placeholder="Defines regulatory scope and equipment capabilities..."
                    rows={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddDeptOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
                  >
                    Confirm Registration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dept.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {dept.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Code: {dept.code}</span>
                  </div>

                  <button
                    onClick={() => toggleDepartmentStatus(dept.id)}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                      dept.status === 'ACTIVE'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title={dept.status === 'ACTIVE' ? 'Deactivate Department' : 'Reactivate Department'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{dept.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{dept.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Appointed Manager</span>
                    <span className="font-semibold text-slate-800">{dept.headManagerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Email</span>
                    <span className="font-semibold text-slate-800 truncate block">{dept.contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Staff</span>
                    <span className="font-semibold text-slate-800">{dept.activeStaffCount} Specialists</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Annual Budget</span>
                    <span className="font-semibold text-emerald-600">${(dept.budgetAllocated / 1000000).toFixed(2)}M</span>
                  </div>
                </div>

                {/* SLA Thresholds */}
                <div className="text-[11px] text-slate-600">
                  <span className="font-bold text-slate-700 uppercase block mb-1">Target SLAs:</span>
                  <div className="flex gap-2">
                    <span className="bg-slate-100 px-2 py-0.5 rounded">Low: {dept.slaHours.LOW}h</span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded">Med: {dept.slaHours.MEDIUM}h</span>
                    <span className="bg-orange-50 text-orange-800 px-2 py-0.5 rounded">High: {dept.slaHours.HIGH}h</span>
                    <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-bold">Crit: {dept.slaHours.CRITICAL}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: USERS & PERMISSIONS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Team & Workforce Management</h3>
              <p className="text-xs text-slate-500">
                Add maintenance staff, assign managers, monitor team workloads, and manage permissions
              </p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          </div>

          {/* Add User Modal */}
          {isAddUserOpen && (
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold">Create New Team Account</h4>
                <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Full Legal Name:</label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Officer Nathan Drake"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Email Address:</label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="name@civicpulse.gov"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">System Role:</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="MAINTENANCE_STAFF">Maintenance Staff</option>
                      <option value="DEPARTMENT_MANAGER">Department Manager</option>
                      <option value="ADMIN">System Admin</option>
                      <option value="CITIZEN">Citizen</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Assigned Department:</label>
                    <select
                      value={newUserDeptId}
                      onChange={(e) => setNewUserDeptId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">Patrol / Civic Zone:</label>
                    <input
                      type="text"
                      value={newUserZone}
                      onChange={(e) => setNewUserZone(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
                  >
                    Confirm Member Creation
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* User Table with Workload Monitoring */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department / Zone</th>
                  <th className="py-3 px-3">Workload Status</th>
                  <th className="py-3 px-3">Completed Work</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const staffTasks = issues.filter(i => i.assignedStaffId === u.id && i.status !== 'RESOLVED' && i.status !== 'CLOSED');
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : u.role === 'DEPARTMENT_MANAGER'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : u.role === 'MAINTENANCE_STAFF'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {u.departmentId
                          ? departments.find((d) => d.id === u.departmentId)?.name || 'General'
                          : u.assignedZone || 'Citywide'}
                      </td>
                      <td className="py-3 px-3">
                        {u.role === 'MAINTENANCE_STAFF' ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            staffTasks.length > 2
                              ? 'bg-rose-100 text-rose-800'
                              : staffTasks.length > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {staffTasks.length} Active Jobs
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">
                        {u.role === 'MAINTENANCE_STAFF' ? `${u.completedTasksCount || 0} Resolved` : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete user account for ${u.name}?`)) {
                              deleteUser(u.id);
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 p-1"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM CONFIGURATIONS */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Global Platform Parameters</h3>
            <p className="text-xs text-slate-500">
              Emergency broadcasts, SLA warning timers, and automated dispatch rules
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase">
                    Citywide Emergency Broadcast Banner
                  </h4>
                  <p className="text-xs text-rose-700">
                    Pins a high-priority red alert ticker to the top of all citizen and staff portals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateSystemConfig({
                      emergencyAlert: {
                        ...systemConfig.emergencyAlert,
                        active: !systemConfig.emergencyAlert.active,
                      },
                    })
                  }
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    systemConfig.emergencyAlert.active
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {systemConfig.emergencyAlert.active ? 'ACTIVE (PULSING)' : 'DISABLED'}
                </button>
              </div>

              {systemConfig.emergencyAlert.active && (
                <div>
                  <label className="text-[11px] font-bold text-rose-800 block mb-1">
                    Alert Message Broadcast:
                  </label>
                  <input
                    type="text"
                    value={systemConfig.emergencyAlert.message}
                    onChange={(e) =>
                      updateSystemConfig({
                        emergencyAlert: {
                          ...systemConfig.emergencyAlert,
                          message: e.target.value,
                        },
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white"
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Duplicate Issue Detection Radius (Meters)
                </h4>
                <p className="text-xs text-slate-500">
                  Flags potential duplicate citizen reports submitted within this distance of an active ticket.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={systemConfig.duplicateDetectionRadiusMeters}
                  onChange={(e) =>
                    updateSystemConfig({ duplicateDetectionRadiusMeters: Number(e.target.value) })
                  }
                  className="w-20 p-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center"
                />
                <span className="text-xs text-slate-600 font-semibold">Meters</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  SLA Warning Threshold (Hours before breach)
                </h4>
                <p className="text-xs text-slate-500">
                  Sends urgent push notifications to managers when remaining SLA drops below this value.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={systemConfig.slaWarningThresholdHours}
                  onChange={(e) =>
                    updateSystemConfig({ slaWarningThresholdHours: Number(e.target.value) })
                  }
                  className="w-16 p-1.5 border border-slate-300 rounded-lg text-xs font-bold text-center"
                />
                <span className="text-xs text-slate-600 font-semibold">Hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
