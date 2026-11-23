'use client';

import React, { useState } from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { Issue, User, IssuePriority, IssueStatus } from '../../types';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Check,
  RotateCcw,
  Wrench,
  Camera,
  MapPin,
  ChevronRight,
  TrendingUp,
  Archive,
  ArrowRightLeft,
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

interface ManagerDashboardProps {
  onSelectIssue: (issue: Issue) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onSelectIssue }) => {
  const { currentUser, issues, departments, users, reviewIssue, assignTask } = useCivicPulse();

  const userDept = departments.find((d) => d.id === currentUser.departmentId) || departments[0];

  const [activeTab, setActiveTab] = useState<'triage' | 'under_review' | 'assigned' | 'resolved' | 'closed' | 'workforce' | 'all'>('triage');
  const [searchQuery, setSearchQuery] = useState('');

  // Department specific issues
  const deptIssues = issues.filter((i) => i.departmentId === userDept.id);

  // Sub-queues strictly based on workflow
  const triageQueue = deptIssues.filter((i) => i.status === 'SUBMITTED');
  const underReviewQueue = deptIssues.filter((i) => i.status === 'UNDER_REVIEW');
  const inProgressQueue = deptIssues.filter((i) => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS');
  const resolvedQueue = deptIssues.filter((i) => i.status === 'RESOLVED');
  const closedQueue = deptIssues.filter((i) => i.status === 'CLOSED');

  // Staff members in this department
  const deptStaff = users.filter(
    (u) => u.role === 'MAINTENANCE_STAFF' && (!u.departmentId || u.departmentId === userDept.id)
  );

  const filteredList = deptIssues.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.location.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'triage') return i.status === 'SUBMITTED';
    if (activeTab === 'under_review') return i.status === 'UNDER_REVIEW';
    if (activeTab === 'assigned') return i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS';
    if (activeTab === 'resolved') return i.status === 'RESOLVED';
    if (activeTab === 'closed') return i.status === 'CLOSED';
    return true; // 'all'
  });

  return (
    <div className="space-y-6">
      
      {/* Department Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <Briefcase className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Department Operations Command
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {userDept.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Welcome, Manager {currentUser.name}. You have{' '}
            <span className="text-amber-400 font-bold">{triageQueue.length} submitted reports</span>,{' '}
            <span className="text-cyan-400 font-bold">{underReviewQueue.length} under review</span>, and{' '}
            <span className="text-teal-400 font-bold">{resolvedQueue.length} jobs awaiting official case closing</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Active SLA Target</span>
            <span className="text-xs font-semibold text-white">Critical: {userDept.slaHours.CRITICAL}h / High: {userDept.slaHours.HIGH}h</span>
          </div>
        </div>
      </div>

      {/* Queue Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab('triage')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeTab === 'triage'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase text-purple-700">1. Submitted</span>
            <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{triageQueue.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">New citizen reports</p>
        </button>

        <button
          onClick={() => setActiveTab('under_review')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeTab === 'under_review'
              ? 'bg-cyan-50 border-cyan-300 ring-2 ring-cyan-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase text-cyan-700">2. Under Review</span>
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{underReviewQueue.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Prioritized & ready</p>
        </button>

        <button
          onClick={() => setActiveTab('assigned')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeTab === 'assigned'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase text-amber-700">3. In Progress</span>
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{inProgressQueue.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Under field repair</p>
        </button>

        <button
          onClick={() => setActiveTab('resolved')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeTab === 'resolved'
              ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase text-teal-700">4. Resolved</span>
            <Camera className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{resolvedQueue.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Needs closing sign-off</p>
        </button>

        <button
          onClick={() => setActiveTab('workforce')}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeTab === 'workforce'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase text-indigo-700">Staff Workload</span>
            <Users className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{deptStaff.length}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Field technicians</p>
        </button>
      </div>

      {/* WORKFORCE WORKLOAD VIEW */}
      {activeTab === 'workforce' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Department Workforce Workload Balancing
            </h3>
            <span className="text-xs text-slate-500">
              Department: {userDept.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deptStaff.map((staff) => {
              const staffTasks = deptIssues.filter((i) => i.assignedStaffId === staff.id && i.status !== 'CLOSED');
              return (
                <div
                  key={staff.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{staff.name}</h4>
                      <p className="text-xs text-slate-500">{staff.assignedZone}</p>
                      <span className="text-[10px] font-mono text-slate-400">{staff.phone}</span>
                    </div>
                  </div>

                  {staff.skills && (
                    <div className="flex flex-wrap gap-1">
                      {staff.skills.map((skill, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Load</span>
                      <span className="font-bold text-slate-800">{staffTasks.length} Assigned Jobs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Completed</span>
                      <span className="font-bold text-emerald-600">{staff.completedTasksCount || 0} Repaired</span>
                    </div>
                  </div>

                  {staffTasks.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Current Assignments:</span>
                      {staffTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => onSelectIssue(t)}
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs cursor-pointer flex items-center justify-between"
                        >
                          <span className="font-mono text-sky-700 font-bold truncate max-w-[140px]">{t.id}: {t.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${getPriorityStyles(t.priority).badge}`}>
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ISSUES QUEUE (TRIAGE, UNDER_REVIEW, ACTIVE, RESOLVED, CLOSED) */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search department reports by ID, title, or address..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('triage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'triage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Submitted ({triageQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('under_review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'under_review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Review ({underReviewQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'assigned' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                In Progress ({inProgressQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'resolved' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Resolved ({resolvedQueue.length})
              </button>
              <button
                onClick={() => setActiveTab('closed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  activeTab === 'closed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Closed ({closedQueue.length})
              </button>
            </div>
          </div>

          {/* Issue Cards */}
          <div className="space-y-3">
            {filteredList.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No issues currently in this department queue.
              </div>
            ) : (
              filteredList.map((issue) => {
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
                      <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
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

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className={`text-[11px] font-semibold flex items-center gap-1 justify-end ${
                          sla.isBreached ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {sla.text}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Assigned: {issue.assignedStaffName || 'None'}
                        </span>
                      </div>

                      {/* Direct CTA */}
                      {issue.status === 'SUBMITTED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Review & Triage
                        </button>
                      ) : issue.status === 'RESOLVED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1"
                        >
                          <Archive className="w-3.5 h-3.5" /> Close Issue
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(issue);
                          }}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                        >
                          Details →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
