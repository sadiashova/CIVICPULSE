'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCivicPulse } from '../context/CivicPulseContext';
import { Issue, IssueCategory } from '../types';
import { Navbar } from '../components/Navbar';
import { AdminDashboard } from '../components/dashboards/AdminDashboard';
import { ManagerDashboard } from '../components/dashboards/ManagerDashboard';
import { StaffDashboard } from '../components/dashboards/StaffDashboard';
import { CitizenDashboard } from '../components/dashboards/CitizenDashboard';
import { IssueDetailModal } from '../components/IssueDetailModal';
import { NewIssueModal } from '../components/NewIssueModal';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  Shield,
  MapPin,
  CheckCircle,
  Heart,
  Building,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Hammer,
  Zap,
  Droplet,
  Footprints,
  Trash2,
  Trophy,
  Users,
  Clock,
  Radio,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';
import { getCategoryLabel } from '../lib/utils';

export default function HomePage() {
  const { currentUser, issues, departments, isTelemetryActive } = useCivicPulse();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'WORKSPACE' | 'LANDING'>('WORKSPACE');
  const [sliderPosition, setSliderPosition] = useState(50);

  const totalIssuesCount = issues.length;
  const resolvedIssuesCount = issues.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
  const activeTasksCount = issues.filter((i) => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS').length;

  const categories: { id: IssueCategory; label: string; icon: any; color: string }[] = [
    { id: 'ROAD_DAMAGE', label: 'Road Damage', icon: Hammer, color: 'bg-amber-500' },
    { id: 'STREETLIGHT', label: 'Streetlight', icon: Zap, color: 'bg-yellow-500' },
    { id: 'DRAINAGE', label: 'Drainage', icon: Droplet, color: 'bg-blue-500' },
    { id: 'FOOTPATH', label: 'Footpath', icon: Footprints, color: 'bg-purple-500' },
    { id: 'WASTE_MANAGEMENT', label: 'Waste Management', icon: Trash2, color: 'bg-emerald-500' },
    { id: 'PUBLIC_INFRASTRUCTURE', label: 'Public Infrastructure', icon: Building, color: 'bg-pink-500' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Global Navigation with Role Switcher & Notifications */}
      <Navbar onSelectIssue={(issue) => setSelectedIssue(issue)} />

      {/* View Mode Mode Switcher Ribbon */}
      <div className="bg-slate-900/90 dark:bg-slate-950 border-b border-slate-800 py-2.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">GovTech Active Portal:</span>
            <span className="text-slate-400">
              Logged in as <strong className="text-sky-400">{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('WORKSPACE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'WORKSPACE'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Role Workspace ({currentUser.role.replace('_', ' ')})</span>
            </button>
            <button
              onClick={() => setViewMode('LANDING')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'LANDING'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Public Landing & City Telemetry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dynamic Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {viewMode === 'LANDING' ? (
          /* ================= LANDING PAGE SHOWCASE ================= */
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Hero Section */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
              <div className="max-w-3xl space-y-5 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Official Smart City Infrastructure Management Platform</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                  Transparent Municipal Governance,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">
                    From Citizen Report to Field Resolution.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  CivicPulse bridges citizens, 6 municipal departments, and 24 field maintenance teams. Report potholes, dark streetlights, drainage obstructions, and track certified repairs with real-time GPS telemetry.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="py-3 px-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/30 flex items-center gap-2 transition active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report a Public Issue</span>
                  </button>
                  <Link
                    href="/issues"
                    className="py-3 px-6 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 flex items-center gap-2 transition"
                  >
                    <span>Browse All Issues Registry</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Live City Telemetry KPI Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tracked Incidents
                </span>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                  {totalIssuesCount}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
                  ✓ 100% Validated GPS
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Certified Resolved
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {resolvedIssuesCount}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  With before/after photo proof
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active Dispatch Orders
                </span>
                <div className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
                  {activeTasksCount}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  In progress by field crews
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  SLA Turnaround Rate
                </span>
                <div className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400 mt-1">
                  96.8%
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Avg 15.4h resolution time
                </span>
              </div>
            </div>

            {/* Problem Categories Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Public Infrastructure Categories
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Direct automated dispatch to 6 specialized municipal departments
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const catCount = issues.filter((i) => i.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-2.5 hover:border-sky-500 transition"
                    >
                      <div className={`w-11 h-11 rounded-2xl ${cat.color} flex items-center justify-center text-white mx-auto shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {cat.label}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                          {catCount} Reports
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Before & After Interactive Showcase */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-sky-500" />
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      Field Resolution Transparency: Before & After Proof
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Drag the slider to compare initial citizen report against technician work completion
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                  Ticket #CP-8105 • Pothole Reconstruction
                </span>
              </div>

              {/* Split Slider */}
              <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden select-none border border-slate-200 dark:border-slate-700">
                {/* Before Image */}
                <img
                  src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80"
                  alt="Before Repair"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <span className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-rose-600/90 text-white font-bold text-xs backdrop-blur shadow">
                  Before: Reported Damage
                </span>

                {/* After Image with Clip Path */}
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1578965762804-0c8f10dd18fa?auto=format&fit=crop&w=1200&q=80"
                    alt="After Repair"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <span className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-emerald-600/90 text-white font-bold text-xs backdrop-blur shadow">
                    After: Completed Repair
                  </span>
                </div>

                {/* Split line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-20 pointer-events-none"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-2xl border-2 border-sky-600 flex items-center justify-center text-sky-600 font-bold text-xs">
                    ↔
                  </div>
                </div>

                <input
                  type="range"
                  min="5"
                  max="95"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>
            </div>

            {/* Public Interactive GIS Vector Map */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Real-Time Municipal Incident Map
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interactive GIS vector coordinates with Heatmap density clustering across all sectors
                  </p>
                </div>
              </div>
              <InteractiveMap
                issues={issues}
                interactive={false}
                height="450px"
                onIssueClick={(issue) => setSelectedIssue(issue)}
              />
            </div>

            {/* Role Gateway Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">
                  Admin Role
                </span>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">System Administration</h4>
                <p className="text-xs text-slate-500">Manage 6 departments, user access control, and executive analytics.</p>
                <Link href="/admin" className="text-xs text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-1 pt-1">
                  Open Console →
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                  Manager Role
                </span>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">Department Triage</h4>
                <p className="text-xs text-slate-500">Verify issues, assign staff dispatch, and review completed work.</p>
                <Link href="/department" className="text-xs text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-1 pt-1">
                  Open Triage →
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  Staff Role
                </span>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">Field Maintenance</h4>
                <p className="text-xs text-slate-500">24 certified field technicians managing patrol orders and completion reports.</p>
                <Link href="/team" className="text-xs text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1 pt-1">
                  View Roster →
                </Link>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  Citizen Role
                </span>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">Civic Engagement</h4>
                <p className="text-xs text-slate-500">Report problems, track 5-stage progress, and provide satisfaction ratings.</p>
                <Link href="/my-reports" className="text-xs text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1 pt-1">
                  My Reports →
                </Link>
              </div>
            </div>

          </div>
        ) : (
          /* ================= ACTIVE ROLE WORKSPACE ================= */
          <>
            {currentUser.role === 'ADMIN' && (
              <AdminDashboard
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {currentUser.role === 'DEPARTMENT_MANAGER' && (
              <ManagerDashboard
                onSelectIssue={(issue) => setSelectedIssue(issue)}
              />
            )}

            {currentUser.role === 'MAINTENANCE_STAFF' && (
              <StaffDashboard
                onSelectIssue={(issue) => setSelectedIssue(issue)}
              />
            )}

            {currentUser.role === 'CITIZEN' && (
              <CitizenDashboard
                onSelectIssue={(issue) => setSelectedIssue(issue)}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Shared Issue Detail Drawer / Modal */}
      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />

      {/* Global New Issue Report Modal */}
      <NewIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={(id) => {}}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">CivicPulse Smart City Infrastructure Management Platform</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">GovTech Enterprise Edition v4.0.0</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>SLA Engine Active</span>
            <span>•</span>
            <span>GIS Map Telemetry Online</span>
            <span>•</span>
            <span className="text-sky-400">108 Issues • 6 Departments • 24 Staff</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
