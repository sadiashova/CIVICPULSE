'use client';

import React, { useState } from 'react';
import { Issue, UserRole, IssuePriority, IssueStatus } from '../types';
import { useCivicPulse } from '../context/CivicPulseContext';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Send,
  Camera,
  Star,
  ThumbsUp,
  FileText,
  Wrench,
  RotateCcw,
  Building2,
  DollarSign,
  AlertCircle,
  ExternalLink,
  GitMerge,
  ArrowRightLeft,
  Archive,
  Printer,
  BellRing,
} from 'lucide-react';
import {
  formatDate,
  formatTimeAgo,
  getSlaRemaining,
  getPriorityStyles,
  getStatusStyles,
  getCategoryLabel,
} from '../lib/utils';
import { InteractiveMap } from './InteractiveMap';

interface IssueDetailModalProps {
  issue: Issue | null;
  onClose: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, onClose }) => {
  const {
    currentUser,
    users,
    departments,
    issues,
    reviewIssue,
    rejectIssue,
    assignTask,
    updateTaskStatus,
    submitWorkReport,
    closeIssue,
    reopenTask,
    transferDepartment,
    mergeDuplicate,
    submitCitizenFeedback,
    upvoteIssue,
    addIssueNote,
    hasPermission,
    sendMaintenanceReminder,
  } = useCivicPulse();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'report' | 'notes'>('overview');

  // Manager action states
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<IssuePriority>('MEDIUM');
  const [assignNote, setAssignNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [closingNote, setClosingNote] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);

  // Department Transfer State
  const [showTransferBox, setShowTransferBox] = useState(false);
  const [targetDeptId, setTargetDeptId] = useState(departments[0]?.id || '');
  const [transferReason, setTransferReason] = useState('');

  // Duplicate Merge State
  const [showMergeBox, setShowMergeBox] = useState(false);
  const [targetMergeId, setTargetMergeId] = useState('');
  const [mergeReason, setMergeReason] = useState('');

  // Staff report states
  const [laborHours, setLaborHours] = useState(2.5);
  const [costEstimate, setCostEstimate] = useState(150);
  const [partsInput, setPartsInput] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [summary, setSummary] = useState('');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  );

  // Citizen feedback states
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSatisfaction, setFeedbackSatisfaction] = useState<'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'POOR'>('EXCELLENT');
  const [feedbackComment, setFeedbackComment] = useState('');

  // Note state
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  if (!issue) return null;

  const priorityStyles = getPriorityStyles(issue.priority);
  const statusStyles = getStatusStyles(issue.status);
  const slaInfo = getSlaRemaining(issue.slaDeadline, issue.status);

  // Department staff members
  const deptStaff = users.filter(
    (u) => u.role === 'MAINTENANCE_STAFF' && (!u.departmentId || u.departmentId === issue.departmentId)
  );

  const canManage =
    currentUser.role === 'ADMIN' ||
    (currentUser.role === 'DEPARTMENT_MANAGER' &&
      (!currentUser.departmentId || currentUser.departmentId === issue.departmentId));

  const isAssignedStaff =
    currentUser.role === 'MAINTENANCE_STAFF' && issue.assignedStaffId === currentUser.id;

  // Handlers
  const handleReview = () => {
    reviewIssue(issue.id, selectedPriority || issue.priority);
  };

  const handleAssign = () => {
    if (!selectedStaffId) return;
    assignTask(issue.id, selectedStaffId, undefined, assignNote);
    setAssignNote('');
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectIssue(issue.id, rejectReason);
    setShowRejectBox(false);
  };

  const handleStaffStart = () => {
    updateTaskStatus(issue.id, 'IN_PROGRESS', 'Field technician arrived on site. Maintenance actively in progress.');
  };

  const handleStaffSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const partsArray = partsInput.split(',').map((p) => p.trim()).filter(Boolean);
    submitWorkReport(
      issue.id,
      {
        laborHours: Number(laborHours),
        costEstimate: Number(costEstimate),
        partsUsed: partsArray.length > 0 ? partsArray : ['Standard municipal engineering components'],
        rootCause: rootCause || 'Wear and environmental stress',
        summary: summary || 'Completed repair in accordance with smart city infrastructure codes.',
      },
      [completionPhotoUrl]
    );
  };

  const handleCloseIssue = () => {
    closeIssue(issue.id, closingNote || 'Work inspected, certified, and officially closed.');
  };

  const handleReopen = () => {
    if (!reopenReason.trim()) return;
    reopenTask(issue.id, reopenReason);
    setShowReopenBox(false);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDeptId) return;
    transferDepartment(issue.id, targetDeptId, transferReason || 'Reassigned to matching jurisdiction');
    setShowTransferBox(false);
  };

  const handleMerge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMergeId) return;
    mergeDuplicate(issue.id, targetMergeId, mergeReason || 'Identified as duplicate report');
    setShowMergeBox(false);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCitizenFeedback(issue.id, {
      rating: feedbackRating,
      satisfaction: feedbackSatisfaction,
      comment: feedbackComment,
      civicPraiseTags: ['Quick Turnaround', 'Clean Worksite', 'Professional Service'],
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addIssueNote(issue.id, newNote, isInternalNote);
    setNewNote('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold">
              {issue.id}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priorityStyles.badge}`}>
              {issue.priority} Priority
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyles.badge}`}>
              {statusStyles.label}
            </span>
            {issue.isDuplicate && (
              <span className="text-[10px] bg-amber-500 text-slate-900 font-bold px-2 py-0.5 rounded-full">
                Duplicate of #{issue.duplicateOfId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Print / Save Official PDF Dossier (Bonus Challenge #7)"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              onClick={() => upvoteIssue(issue.id)}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Endorse / Upvote this issue"
            >
              <ThumbsUp className="w-3.5 h-3.5 text-sky-400" />
              <span>{issue.upvotes}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SLA & Department Header Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              {issue.departmentName}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              Reported {formatDate(issue.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Target SLA:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                slaInfo.isBreached
                  ? 'bg-rose-100 text-rose-700 font-bold animate-pulse'
                  : issue.status === 'RESOLVED' || issue.status === 'CLOSED'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Clock className="w-3 h-3" />
              {slaInfo.text}
            </span>
          </div>
        </div>

        {/* Workflow Progress Banner */}
        <div className="bg-slate-100/70 border-b border-slate-200 px-6 py-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold max-w-2xl mx-auto">
            {['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((stepStatus, idx) => {
              const order = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
              const currentIdx = order.indexOf(issue.status);
              const isPast = currentIdx >= idx;
              const isCurrent = currentIdx === idx;

              return (
                <div key={stepStatus} className="flex items-center gap-1.5">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isPast ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={isCurrent ? 'text-sky-700 font-bold' : isPast ? 'text-slate-700' : 'text-slate-400'}>
                    {stepStatus.replace('_', ' ')}
                  </span>
                  {idx < 5 && <span className="text-slate-300 mx-1">›</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Overview & Evidence
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Audit Resolution History ({issue.timeline.length})
          </button>
          {issue.workReport && (
            <button
              onClick={() => setActiveTab('report')}
              className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> Technical Work Report
            </button>
          )}
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'notes'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Maintenance Notes ({issue.notes.length})
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Title & Description */}
              <div>
                <span className="text-[11px] font-bold tracking-wider text-sky-600 uppercase">
                  {getCategoryLabel(issue.category)}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{issue.title}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {issue.description}
                </p>
              </div>

              {/* Photos Comparison: Before & After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                  <div className="bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      Citizen Photo Evidence (Before)
                    </span>
                    <span className="text-[10px] text-slate-500">Initial Submission</span>
                  </div>
                  <div className="h-56 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                    {issue.photoUrls.length > 0 ? (
                      <img
                        src={issue.photoUrls[0]}
                        alt="Initial Issue Evidence"
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-slate-500 text-xs">No initial image provided</div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm">
                  <div className="bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center justify-between border-b border-slate-200">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Field Repair Verification (After)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {(issue.completionPhotos?.length || 0) > 0 ? 'Verified Complete' : 'Pending Repair'}
                    </span>
                  </div>
                  <div className="h-56 relative bg-slate-900 flex items-center justify-center overflow-hidden">
                    {(issue.completionPhotos?.length || 0) > 0 ? (
                      <img
                        src={issue.completionPhotos![0]}
                        alt="Completed Repair Evidence"
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                        <p className="text-xs font-medium">No completion photo submitted yet.</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Field technicians capture proof upon finishing site work.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & GPS Interactive Pin */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" /> Geographic Location & Coordinates
                </h3>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Address</span>
                    <span className="font-semibold text-slate-800">{issue.location.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Landmark</span>
                    <span className="font-semibold text-slate-800">{issue.location.landmark || 'None specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">GPS Coordinates</span>
                    <span className="font-mono text-slate-800">
                      {issue.location.lat.toFixed(5)}° N, {issue.location.lng.toFixed(5)}° W
                    </span>
                  </div>
                </div>
                <InteractiveMap
                  center={{ lat: issue.location.lat, lng: issue.location.lng }}
                  selectedLocation={issue.location}
                  interactive={false}
                  height="200px"
                />
              </div>

              {/* Citizen Information & Assignee Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                    <User className="w-3.5 h-3.5 text-slate-500" /> Reporting Citizen Details
                  </h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p><span className="font-semibold text-slate-800">Name:</span> {issue.citizenName}</p>
                    <p><span className="font-semibold text-slate-800">Email:</span> {issue.citizenEmail}</p>
                    <p><span className="font-semibold text-slate-800">Phone:</span> {issue.citizenPhone}</p>
                    <p><span className="font-semibold text-slate-800">Submitted:</span> {formatDate(issue.createdAt)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5 mb-2.5">
                    <Wrench className="w-3.5 h-3.5 text-sky-600" /> Maintenance Assignment
                  </h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-800">Technician:</span>{' '}
                      {issue.assignedStaffName ? (
                        <span className="font-semibold text-sky-700">{issue.assignedStaffName}</span>
                      ) : (
                        <span className="text-amber-600 font-medium italic">Unassigned (Awaiting Manager)</span>
                      )}
                    </p>
                    {issue.assignedAt && (
                      <p><span className="font-semibold text-slate-800">Assigned Date:</span> {formatDate(issue.assignedAt)}</p>
                    )}
                    {issue.resolvedAt && (
                      <p><span className="font-semibold text-slate-800">Resolved Date:</span> {formatDate(issue.resolvedAt)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Citizen Feedback Viewer */}
              {issue.citizenFeedback && (
                <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      Citizen Satisfaction & Rating
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      {formatTimeAgo(issue.citizenFeedback.submittedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (issue.citizenFeedback?.rating || 0)
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-emerald-800 ml-2">
                      {issue.citizenFeedback.rating} / 5 ({issue.citizenFeedback.satisfaction})
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900 italic bg-white/70 p-3 rounded-lg border border-emerald-200/50">
                    &ldquo;{issue.citizenFeedback.comment}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIT RESOLUTION TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Immutable Incident Resolution History
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {issue.timeline.map((ev, index) => {
                  const sStyles = getStatusStyles(ev.status);
                  return (
                    <div key={ev.id || index} className="relative group">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white shadow ${sStyles.bg}`} />
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-slate-800">{ev.title}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDate(ev.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{ev.description}</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">
                            Responsible User: {ev.actorName} ({ev.actorRole.replace('_', ' ')})
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-semibold">
                            Status: {ev.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WORK REPORT */}
          {activeTab === 'report' && issue.workReport && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Certified Technical Maintenance Report</h3>
                  <p className="text-xs text-slate-500">Submitted by field responder upon completing repairs</p>
                </div>
                <span className="text-xs font-mono text-slate-400">{formatDate(issue.workReport.submittedAt)}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Labor Hours</span>
                  <span className="text-lg font-bold text-slate-800">
                    {issue.workReport.laborHours || issue.workReport.hoursSpent || 0} Hours
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Material Cost Assessment</span>
                  <span className="text-lg font-bold text-emerald-600">
                    ${issue.workReport.costEstimate || 0} USD
                  </span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Root Cause</span>
                <p className="text-xs text-slate-700 font-medium">
                  {issue.workReport.rootCause || 'Environmental wear and infrastructure stress'}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Parts & Materials Used</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(issue.workReport.partsUsed || issue.workReport.materialsUsed || []).map((part, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-200">
                      • {part}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Work Summary</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {issue.workReport.summary || issue.workReport.notes || 'Repairs completed and certified by field crew.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {issue.notes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No notes added to this issue yet.</p>
                ) : (
                  issue.notes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-xl border text-xs ${
                        note.isInternal
                          ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold flex items-center gap-1.5">
                          {note.authorName}
                          <span className="text-[10px] font-normal px-1.5 py-0.2 bg-white/70 rounded border">
                            {note.authorRole.replace('_', ' ')}
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          {note.isInternal && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              INTERNAL
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">{formatTimeAgo(note.createdAt)}</span>
                        </div>
                      </div>
                      <p className="leading-relaxed">{note.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Add Operational Note</h4>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type an observation, site instruction, or field update..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    Mark as internal department note (hidden from citizen)
                  </label>
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Post Note
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* ROLE ACTION PANELS (DYNAMIC ACCORDING TO USER ROLE & STATUS) */}
          {/* ============================================================ */}

          {/* 1. DEPARTMENT MANAGER / ADMIN ACTION PANEL */}
          {canManage && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-sky-400" />
                  <span className="font-bold text-sm">Department Operations Management Controls</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {currentUser.name} ({currentUser.role})
                </span>
              </div>

              {/* Action Toolbar: Department Transfer & Duplicate Merging */}
              <div className="flex flex-wrap items-center gap-2 text-xs border-b border-slate-700/60 pb-3">
                <button
                  type="button"
                  onClick={() => setShowTransferBox(!showTransferBox)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 font-medium flex items-center gap-1.5 border border-slate-700"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" /> Transfer Department
                </button>
                <button
                  type="button"
                  onClick={() => setShowMergeBox(!showMergeBox)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 font-medium flex items-center gap-1.5 border border-slate-700"
                >
                  <GitMerge className="w-3.5 h-3.5 text-amber-400" /> Merge Duplicate
                </button>
                {issue.assignedStaffId && (issue.status === 'ASSIGNED' || issue.status === 'IN_PROGRESS') && (
                  <button
                    type="button"
                    onClick={() => sendMaintenanceReminder(issue.id)}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-medium flex items-center gap-1.5 border border-amber-500/40"
                    title="Automated Maintenance SLA Reminder (Bonus Challenge #6)"
                  >
                    <BellRing className="w-3.5 h-3.5 text-amber-400" /> Send SLA Reminder
                  </button>
                )}
              </div>

              {/* Department Transfer Form */}
              {showTransferBox && (
                <form onSubmit={handleTransfer} className="p-3 bg-slate-800/90 rounded-xl border border-sky-500/40 space-y-2 text-xs">
                  <span className="font-bold text-sky-300 block">Transfer to Another Department Jurisdiction:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={targetDeptId}
                      onChange={(e) => setTargetDeptId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      placeholder="Reason for transfer..."
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <button type="submit" className="px-3 py-1.5 bg-sky-600 text-white font-bold rounded-lg">
                    Confirm Transfer
                  </button>
                </form>
              )}

              {/* Duplicate Merging Form */}
              {showMergeBox && (
                <form onSubmit={handleMerge} className="p-3 bg-slate-800/90 rounded-xl border border-amber-500/40 space-y-2 text-xs">
                  <span className="font-bold text-amber-300 block">Merge into Existing Primary Issue:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={targetMergeId}
                      onChange={(e) => setTargetMergeId(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                      required
                    >
                      <option value="">Select Primary Issue ID...</option>
                      {issues.filter(i => i.id !== issue.id).map((i) => (
                        <option key={i.id} value={i.id}>{i.id} — {i.title.substring(0, 30)}...</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={mergeReason}
                      onChange={(e) => setMergeReason(e.target.value)}
                      placeholder="e.g. Duplicate report at same intersection"
                      className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <button type="submit" className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-lg">
                    Confirm Merge
                  </button>
                </form>
              )}

              {/* Case A: Issue is SUBMITTED -> Verification & Priority Setting */}
              {issue.status === 'SUBMITTED' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    This citizen report is awaiting departmental triage. Calibrate priority and verify or reject.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Calibrate Priority:</span>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value as IssuePriority)}
                        className="bg-slate-800 border border-slate-600 rounded-lg text-xs px-3 py-1.5 text-white"
                      >
                        <option value="LOW">LOW (Standard)</option>
                        <option value="MEDIUM">MEDIUM (Normal)</option>
                        <option value="HIGH">HIGH (Urgent)</option>
                        <option value="CRITICAL">CRITICAL (Emergency Hazard)</option>
                      </select>
                    </div>

                    <button
                      onClick={handleReview}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Verify & Place Under Review
                    </button>

                    <button
                      onClick={() => setShowRejectBox(!showRejectBox)}
                      className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                    >
                      <AlertTriangle className="w-4 h-4" /> Reject Issue
                    </button>
                  </div>

                  {showRejectBox && (
                    <div className="mt-3 bg-slate-800/90 p-3 rounded-xl border border-rose-500/50 space-y-2">
                      <label className="text-xs font-medium text-rose-300 block">
                        Provide justification for rejection:
                      </label>
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="e.g. Private property outside city municipal boundary"
                        className="w-full text-xs p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                      <button
                        onClick={handleReject}
                        className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Case B: Issue is UNDER_REVIEW or ASSIGNED -> Staff Assignment */}
              {(issue.status === 'UNDER_REVIEW' || issue.status === 'ASSIGNED') && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    {issue.status === 'UNDER_REVIEW'
                      ? 'Issue is under review. Dispatch certified maintenance crew.'
                      : `Currently assigned to ${issue.assignedStaffName}. You can reassign to another specialist.`}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded-lg text-xs px-3 py-2 text-white min-w-[220px]"
                    >
                      <option value="">Select Field Staff Member...</option>
                      {deptStaff.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name} ({st.activeTasks || 0} active jobs)
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={assignNote}
                      onChange={(e) => setAssignNote(e.target.value)}
                      placeholder="Optional dispatch instruction..."
                      className="flex-1 bg-slate-800 border border-slate-600 rounded-lg text-xs px-3 py-2 text-white"
                    />

                    <button
                      onClick={handleAssign}
                      disabled={!selectedStaffId}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition"
                    >
                      Assign Field Crew
                    </button>
                  </div>
                </div>
              )}

              {/* Case C: Issue is RESOLVED -> Manager Review & Official Case Closing */}
              {issue.status === 'RESOLVED' && (
                <div className="space-y-3 bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/40">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Field crew marked repairs completed. Review photos and close ticket officially.
                  </div>
                  <input
                    type="text"
                    value={closingNote}
                    onChange={(e) => setClosingNote(e.target.value)}
                    placeholder="Enter closing remarks or inspection certification..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs px-3 py-2 text-white"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCloseIssue}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow"
                    >
                      <Archive className="w-4 h-4" /> Close & Archive Issue
                    </button>
                    <button
                      onClick={() => setShowReopenBox(!showReopenBox)}
                      className="px-3 py-2 bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" /> Request Rework
                    </button>
                  </div>

                  {showReopenBox && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={reopenReason}
                        onChange={(e) => setReopenReason(e.target.value)}
                        placeholder="Explain why rework is required..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs px-3 py-2 text-white"
                      />
                      <button
                        onClick={handleReopen}
                        className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg"
                      >
                        Confirm Reopen
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Case D: Closed */}
              {issue.status === 'CLOSED' && (
                <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                  <Archive className="w-4 h-4 text-emerald-400" />
                  This case is officially closed and archived in municipal records.
                </div>
              )}
            </div>
          )}

          {/* 2. MAINTENANCE STAFF ACTION PANEL */}
          {currentUser.role === 'MAINTENANCE_STAFF' && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm">Field Maintenance Responder Actions</span>
                </div>
                <span className="text-xs text-slate-400">
                  Specialist: {currentUser.name}
                </span>
              </div>

              {/* Staff Action A: Start Work */}
              {issue.status === 'ASSIGNED' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    You have been dispatched to this location. Tap below upon arrival to transition status to IN PROGRESS.
                  </p>
                  <button
                    onClick={handleStaffStart}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition"
                  >
                    <Clock className="w-4 h-4" /> Start Site Work (Set IN PROGRESS)
                  </button>
                </div>
              )}

              {/* Staff Action B: Submit Work Report & Photos */}
              {issue.status === 'IN_PROGRESS' && (
                <form onSubmit={handleStaffSubmitReport} className="space-y-4">
                  <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                    <Camera className="w-4 h-4" />
                    Submit Repair Completion Evidence & Technical Report
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-300 block mb-1">Labor Hours Expended:</label>
                      <input
                        type="number"
                        step="0.5"
                        value={laborHours}
                        onChange={(e) => setLaborHours(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 block mb-1">Material Cost Assessment ($ USD):</label>
                      <input
                        type="number"
                        value={costEstimate}
                        onChange={(e) => setCostEstimate(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="text-slate-300 block mb-1">Parts & Materials Used (comma separated):</label>
                    <input
                      type="text"
                      value={partsInput}
                      onChange={(e) => setPartsInput(e.target.value)}
                      placeholder="e.g. 50kg asphalt patch, 2x steel anchor bolts, primer"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="text-slate-300 block mb-1">Root Cause Analysis:</label>
                    <input
                      type="text"
                      value={rootCause}
                      onChange={(e) => setRootCause(e.target.value)}
                      placeholder="e.g. Sub-surface erosion, thermal expansion, accidental impact"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>

                  <div className="text-xs">
                    <label className="text-slate-300 block mb-1">Completion Photo URL (Proof of Work):</label>
                    <input
                      type="text"
                      value={completionPhotoUrl}
                      onChange={(e) => setCompletionPhotoUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                      required
                    />
                  </div>

                  <div className="text-xs">
                    <label className="text-slate-300 block mb-1">Technical Work Summary:</label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Describe the repair procedures completed..."
                      rows={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Submit Report & Mark Task Resolved
                  </button>
                </form>
              )}

              {(issue.status === 'RESOLVED' || issue.status === 'CLOSED') && (
                <p className="text-xs text-teal-400 font-medium">
                  ✓ Field repair submitted and verified.
                </p>
              )}
            </div>
          )}

          {/* 3. CITIZEN FEEDBACK FORM */}
          {currentUser.role === 'CITIZEN' && (issue.status === 'RESOLVED' || issue.status === 'CLOSED') && !issue.citizenFeedback && (
            <div className="bg-gradient-to-r from-sky-900 to-indigo-900 text-white p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-sky-800 pb-3">
                <Star className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm">Citizen Service Feedback & Rating</span>
              </div>
              <p className="text-xs text-sky-200">
                Your report has been resolved! Please rate the repair quality and municipal response to help optimize smart city services.
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-sky-200 block mb-1">Satisfaction Rating:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-125 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-500'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-300 ml-2">
                      {feedbackRating === 5
                        ? 'Excellent'
                        : feedbackRating === 4
                        ? 'Good'
                        : feedbackRating === 3
                        ? 'Satisfactory'
                        : 'Needs Improvement'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-sky-200 block mb-1">Feedback Comments:</label>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share your thoughts on the repair outcome..."
                    rows={2}
                    className="w-full bg-sky-950/80 border border-sky-800 rounded-lg p-2 text-xs text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition"
                >
                  Submit Citizen Feedback
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            CivicPulse Official Infrastructure Case #{issue.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Close Modal
          </button>
        </div>

      </div>
    </div>
  );
};
