'use client';

import React, { useState } from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { Issue, IssueStatus } from '../../types';
import {
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Camera,
  AlertTriangle,
  Play,
  FileCheck,
  ChevronRight,
  PhoneCall,
  ExternalLink,
  Archive,
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

interface StaffDashboardProps {
  onSelectIssue: (issue: Issue) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onSelectIssue }) => {
  const { currentUser, issues, updateTaskStatus } = useCivicPulse();

  const myAssignedTasks = issues.filter(
    (i) => i.assignedStaffId === currentUser.id && i.status !== 'CLOSED' && i.status !== 'REJECTED'
  );

  const completedHistory = issues.filter(
    (i) => i.assignedStaffId === currentUser.id && (i.status === 'RESOLVED' || i.status === 'CLOSED')
  );

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'map'>('active');

  const urgentTasks = myAssignedTasks.filter(
    (i) => i.priority === 'CRITICAL' || i.priority === 'HIGH'
  );

  const handleStartRepair = (e: React.MouseEvent, issue: Issue) => {
    e.stopPropagation();
    updateTaskStatus(issue.id, 'IN_PROGRESS', `${currentUser.name} arrived at worksite. Work initiated.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Field Responder Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Wrench className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Field Maintenance Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Field Dispatch Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Welcome, Specialist <span className="text-white font-bold">{currentUser.name}</span>. Patrol Zone:{' '}
            <span className="text-amber-400 font-semibold">{currentUser.assignedZone || 'Sector 4 - Downtown'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Work Orders</span>
            <span className="text-xl font-black text-amber-400">{myAssignedTasks.length} Active Jobs</span>
          </div>
        </div>
      </div>

      {/* Responder Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase text-amber-700">Pending Actions</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myAssignedTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Tasks assigned to unit</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase text-rose-700">Urgent Hazards</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{urgentTasks.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Critical & High priority</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase text-emerald-700">Resolved & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{currentUser.completedTasksCount || completedHistory.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Lifetime repairs logged</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'active' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" /> My Assigned Tasks ({myAssignedTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'map' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Navigation className="w-4 h-4" /> Field Navigation Map
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'completed' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Completed History ({completedHistory.length})
        </button>
      </div>

      {/* TAB 1: ACTIVE TASKS LIST */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {myAssignedTasks.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">All Dispatched Work Completed!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No open maintenance tickets are currently dispatched to your responder unit. Stand by for department dispatch.
              </p>
            </div>
          ) : (
            myAssignedTasks.map((task) => {
              const pStyles = getPriorityStyles(task.priority);
              const sStyles = getStatusStyles(task.status);
              const sla = getSlaRemaining(task.slaDeadline, task.status);

              return (
                <div
                  key={task.id}
                  onClick={() => onSelectIssue(task)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 transition cursor-pointer overflow-hidden"
                >
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
                        {task.photoUrls.length > 0 ? (
                          <img src={task.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs">No img</div>
                        )}
                        <span className={`absolute bottom-0 inset-x-0 h-1.5 ${pStyles.solid}`} />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {task.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pStyles.badge}`}>
                            {task.priority} Priority
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sStyles.badge}`}>
                            {sStyles.label}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900">{task.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-sky-600" />
                            {task.location.address}
                          </span>
                          <span className="text-slate-400">|</span>
                          <span className="font-mono text-[11px]">
                            GPS: {task.location.lat.toFixed(5)}° N, {task.location.lng.toFixed(5)}° W
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className={`text-xs font-bold flex items-center gap-1 justify-end ${
                          sla.isBreached ? 'text-rose-600 animate-pulse' : 'text-slate-700'
                        }`}>
                          <Clock className="w-3.5 h-3.5" />
                          {sla.text}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Assigned {formatTimeAgo(task.assignedAt)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      {task.status === 'ASSIGNED' ? (
                        <button
                          onClick={(e) => handleStartRepair(e, task)}
                          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Arrived / Start Work
                        </button>
                      ) : task.status === 'IN_PROGRESS' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(task);
                          }}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95"
                        >
                          <Camera className="w-3.5 h-3.5" /> Upload Photo & Complete
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectIssue(task);
                          }}
                          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                        >
                          View Task Details →
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE PATROL ROUTE MAP */}
      {activeTab === 'map' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-sky-600" />
                Active Patrol Waypoints & Task GPS Locations
              </h3>
              <p className="text-xs text-slate-500">
                Click on any map marker to view field coordinates and citizen photographs
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {myAssignedTasks.length} Work Targets
            </span>
          </div>
          <InteractiveMap
            issues={myAssignedTasks}
            onIssueClick={(task) => onSelectIssue(task)}
            height="420px"
          />
        </div>
      )}

      {/* TAB 3: COMPLETED LOG */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedHistory.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No completed repair tickets in recent history.
            </div>
          ) : (
            completedHistory.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-700">{issue.id}: {issue.title}</span>
                    <p className="text-xs text-slate-500">{issue.location.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 block">Work Completed</span>
                  <span className="text-[10px] text-slate-400">{formatDate(issue.resolvedAt || issue.closedAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
