'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/Navbar';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { IssueDetailModal } from '../../components/IssueDetailModal';
import { Issue } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight,
  PlusCircle,
  Star,
  Building,
} from 'lucide-react';
import { formatDate, getCategoryLabel, getPriorityStyles, getStatusStyles } from '../../lib/utils';

export default function MyReportsPage() {
  const { currentUser, issues } = useCivicPulse();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Filter reports submitted by current citizen
  const myReports = issues.filter(
    (i) => i.citizenId === currentUser.id || i.citizenEmail?.toLowerCase() === currentUser.email.toLowerCase()
  );

  const workflowSteps = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onSelectIssue={(i) => setSelectedIssue(i)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                My Reported Issues
              </h1>
              <span className="text-xs bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                {myReports.length} Active Records
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track real-time progress, technician dispatch orders, and before/after resolution proof for tickets you submitted.
            </p>
          </div>

          <Link
            href="/issues/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-sky-600/20 transition active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Reports Grid */}
        <div className="mt-8 space-y-4">
          {myReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                No Reports Submitted Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notice a broken streetlight, pothole, or drainage issue in your neighborhood? Submit your first report in under 2 minutes.
              </p>
              <Link
                href="/issues/new"
                className="inline-block px-5 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/30 hover:bg-sky-500 transition"
              >
                File Your First Civic Report
              </Link>
            </div>
          ) : (
            myReports.map((report) => {
              const currentStepIdx = workflowSteps.indexOf(report.status);
              const pStyles = getPriorityStyles(report.priority);
              const sStyles = getStatusStyles(report.status);

              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedIssue(report)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-sky-400 dark:hover:border-sky-500 transition cursor-pointer space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                          {report.ticketNumber || report.id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sStyles.badge}`}>
                          {report.status.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pStyles.badge}`}>
                          {report.priority}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {getCategoryLabel(report.category)}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {report.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {report.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                      {report.photoUrls && report.photoUrls[0] && (
                        <img
                          src={report.photoUrls[0]}
                          alt={report.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                      )}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>

                  {/* 5-Stage Visual Workflow Stepper */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between relative max-w-xl">
                      <div className="absolute left-3 right-3 top-2.5 h-0.5 bg-slate-100 dark:bg-slate-800 -z-0" />
                      {workflowSteps.slice(0, 5).map((step, idx) => {
                        const isDone = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={step} className="flex flex-col items-center gap-1 relative z-10">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                                isDone
                                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-100 dark:ring-emerald-950'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              } ${isCurrent ? 'scale-125' : ''}`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:block">
                              {step.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {report.location.address} ({report.location.cityZone})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Reported {formatDate(report.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
}
