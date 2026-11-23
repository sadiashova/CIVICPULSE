'use client';

import React, { useState } from 'react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { Issue } from '../../types';
import {
  User,
  PlusCircle,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Star,
  ThumbsUp,
  Camera,
  Layers,
  ChevronRight,
  ShieldCheck,
  Search,
  Archive,
} from 'lucide-react';
import {
  formatDate,
  formatTimeAgo,
  getPriorityStyles,
  getStatusStyles,
  getCategoryLabel,
} from '../../lib/utils';
import { InteractiveMap } from '../InteractiveMap';

interface CitizenDashboardProps {
  onSelectIssue: (issue: Issue) => void;
  onOpenReportModal: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onSelectIssue,
  onOpenReportModal,
}) => {
  const { currentUser, issues, upvoteIssue } = useCivicPulse();

  const [activeTab, setActiveTab] = useState<'my_reports' | 'city_map' | 'nearby'>('my_reports');

  const myReports = issues.filter(
    (i) => i.citizenId === currentUser.id || i.citizenEmail === currentUser.email
  );

  const communityReports = issues.filter(
    (i) => i.citizenId !== currentUser.id && i.citizenEmail !== currentUser.email
  );

  const resolvedReports = myReports.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED');
  const pendingReports = myReports.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'REJECTED');

  return (
    <div className="space-y-6">
      
      {/* Citizen Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30">
              <User className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400">
              Citizen Public Service Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Report road hazards, broken lights, and drainage clogs with GPS coordinates & photographs. Follow your report through the automated verification and repair workflow.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-sky-600/30 flex items-center gap-2 transition active:scale-95 shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Citizen Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase text-sky-700">My Submissions</span>
            <Camera className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myReports.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Total tickets filed</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase text-amber-700">Under Repair</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingReports.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">In triage or field fix</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase text-emerald-700">Resolved & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{resolvedReports.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">With photographic proof</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex gap-1">
        <button
          onClick={() => setActiveTab('my_reports')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'my_reports'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" /> My Tracked Reports ({myReports.length})
        </button>
        <button
          onClick={() => setActiveTab('city_map')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'city_map'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" /> Live Public City Map
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeTab === 'nearby'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ThumbsUp className="w-4 h-4" /> Community Feed & Upvote ({communityReports.length})
        </button>
      </div>

      {/* TAB 1: MY TRACKED REPORTS */}
      {activeTab === 'my_reports' && (
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Camera className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">You haven&apos;t filed any reports yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Spotted road damage, broken streetlights, or drainage issues? Submit your first report in 60 seconds.
              </p>
              <button
                onClick={onOpenReportModal}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition"
              >
                Submit Incident Report
              </button>
            </div>
          ) : (
            myReports.map((report) => {
              const pStyles = getPriorityStyles(report.priority);
              const sStyles = getStatusStyles(report.status);

              return (
                <div
                  key={report.id}
                  onClick={() => onSelectIssue(report)}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer overflow-hidden"
                >
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
                        {report.photoUrls.length > 0 ? (
                          <img src={report.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs">No img</div>
                        )}
                        <span className={`absolute bottom-0 inset-x-0 h-1.5 ${pStyles.solid}`} />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {report.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sStyles.badge}`}>
                            {sStyles.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {getCategoryLabel(report.category)}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900">{report.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-sky-600" />
                            {report.location.address}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>Reported {formatDate(report.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {(report.completionPhotos?.length || 0) > 0 && (
                        <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5" /> After Photo Available
                        </div>
                      )}

                      {(report.status === 'RESOLVED' || report.status === 'CLOSED') && !report.citizenFeedback && (
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-300 animate-pulse">
                          ★ Rate Service
                        </span>
                      )}

                      {report.citizenFeedback && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Rated {report.citizenFeedback.rating}/5</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectIssue(report);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Track Status →
                      </button>
                    </div>

                  </div>

                  {/* 5-Stage Visual Workflow Progress Bar */}
                  <div className="bg-slate-50 border-t border-slate-100 px-5 py-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium max-w-xl mx-auto">
                      <div className="flex flex-col items-center">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </span>
                        <span className="mt-1 font-semibold text-slate-800">Submitted</span>
                      </div>
                      <div className={`h-0.5 flex-1 mx-2 ${report.status !== 'SUBMITTED' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      <div className="flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          report.status !== 'SUBMITTED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {report.status !== 'SUBMITTED' ? '✓' : '2'}
                        </span>
                        <span className={`mt-1 font-semibold ${report.status !== 'SUBMITTED' ? 'text-slate-800' : 'text-slate-400'}`}>
                          Under Review
                        </span>
                      </div>
                      <div className={`h-0.5 flex-1 mx-2 ${report.status === 'IN_PROGRESS' || report.status === 'RESOLVED' || report.status === 'CLOSED' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      <div className="flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          report.status === 'IN_PROGRESS' || report.status === 'RESOLVED' || report.status === 'CLOSED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {report.status === 'IN_PROGRESS' || report.status === 'RESOLVED' || report.status === 'CLOSED' ? '✓' : '3'}
                        </span>
                        <span className={`mt-1 font-semibold ${report.status === 'IN_PROGRESS' ? 'text-amber-600' : report.status === 'RESOLVED' || report.status === 'CLOSED' ? 'text-slate-800' : 'text-slate-400'}`}>
                          In Progress
                        </span>
                      </div>
                      <div className={`h-0.5 flex-1 mx-2 ${report.status === 'RESOLVED' || report.status === 'CLOSED' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      <div className="flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          report.status === 'RESOLVED' || report.status === 'CLOSED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {report.status === 'RESOLVED' || report.status === 'CLOSED' ? '✓' : '4'}
                        </span>
                        <span className={`mt-1 font-semibold ${report.status === 'RESOLVED' || report.status === 'CLOSED' ? 'text-emerald-700' : 'text-slate-400'}`}>
                          Resolved
                        </span>
                      </div>
                      <div className={`h-0.5 flex-1 mx-2 ${report.status === 'CLOSED' ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      <div className="flex flex-col items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          report.status === 'CLOSED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {report.status === 'CLOSED' ? '✓' : '5'}
                        </span>
                        <span className={`mt-1 font-semibold ${report.status === 'CLOSED' ? 'text-slate-800' : 'text-slate-400'}`}>
                          Closed
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: LIVE PUBLIC CITY MAP */}
      {activeTab === 'city_map' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600" />
                Smart City Public Infrastructure Status Map
              </h3>
              <p className="text-xs text-slate-500">
                Transparent view of all reported municipal works, ongoing repairs, and completed projects
              </p>
            </div>
            <button
              onClick={onOpenReportModal}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow transition"
            >
              + Report In Area
            </button>
          </div>
          <InteractiveMap
            issues={issues}
            onIssueClick={(i) => onSelectIssue(i)}
            height="440px"
          />
        </div>
      )}

      {/* TAB 3: COMMUNITY FEED & UPVOTES */}
      {activeTab === 'nearby' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 p-4 rounded-xl text-xs text-sky-900 flex items-center justify-between">
            <span>
              Upvoting existing reported issues alerts department managers to high-priority neighborhood concerns!
            </span>
          </div>

          <div className="space-y-3">
            {communityReports.map((item) => {
              const pStyles = getPriorityStyles(item.priority);
              const sStyles = getStatusStyles(item.status);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectIssue(item)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0">
                      {item.photoUrls.length > 0 ? (
                        <img src={item.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-[10px]">No img</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold text-slate-700">{item.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${pStyles.badge}`}>
                          {item.priority}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${sStyles.badge}`}>
                          {sStyles.label}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.location.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        upvoteIssue(item.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-600 border border-slate-200 text-xs font-bold text-slate-700 transition"
                      title="Upvote this problem"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{item.upvotes} Upvotes</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIssue(item);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
