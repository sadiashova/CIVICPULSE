'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCivicPulse } from '../context/CivicPulseContext';
import {
  Shield,
  Bell,
  RefreshCw,
  PlusCircle,
  Users,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Trash2,
  Building,
  User as UserIcon,
  LogIn,
  Sun,
  Moon,
  Radio,
  Activity,
  Layers,
  Sparkles,
  BarChart3,
  FileText,
} from 'lucide-react';
import { RoleSwitcherModal } from './RoleSwitcherModal';
import { NewIssueModal } from './NewIssueModal';
import { AuthModal } from './AuthModal';
import { UserProfileModal } from './UserProfileModal';
import { formatTimeAgo } from '../lib/utils';
import { Issue } from '../types';

interface NavbarProps {
  onSelectIssue?: (issue: Issue) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectIssue }) => {
  const {
    currentUser,
    notifications,
    markNotificationAsRead,
    clearNotifications,
    resetToDefaults,
    issues,
    systemConfig,
    darkMode,
    toggleDarkMode,
    isTelemetryActive,
    toggleTelemetry,
    simulateIncomingReport,
  } = useCivicPulse();

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNewIssueModalOpen, setIsNewIssueModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DEPARTMENT_MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MAINTENANCE_STAFF':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'CITIZEN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 shadow-md">
        
        {/* Emergency Alert Bar if active */}
        {systemConfig.emergencyAlert.active && (
          <div className="bg-rose-600 text-white text-xs py-1.5 px-4 flex items-center justify-between font-medium animate-pulse">
            <div className="flex items-center gap-2 mx-auto">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>MUNICIPAL ADVISORY: {systemConfig.emergencyAlert.message}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & City Status */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 ring-1 ring-white/20 group-hover:scale-105 transition">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-lg tracking-tight">
                    Civic<span className="text-sky-400">Pulse</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    GovTech OS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Smart City Platform</span>
                </div>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
              <Link href="/" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition">
                Home
              </Link>
              <Link href="/issues" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition">
                Issues Registry
              </Link>
              <Link href="/analytics" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition">
                Analytics
              </Link>
              <Link href="/department" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition">
                Departments
              </Link>
              <Link href="/team" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition">
                Team
              </Link>
              {currentUser.role === 'ADMIN' && (
                <Link href="/admin" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition">
                  Admin
                </Link>
              )}
              {currentUser.role === 'CITIZEN' && (
                <Link href="/my-reports" className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition">
                  My Reports
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Live Telemetry Stream Toggle (Bonus #1) */}
            <button
              onClick={toggleTelemetry}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl transition flex items-center gap-1.5 text-xs font-bold ${
                isTelemetryActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-1 ring-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={isTelemetryActive ? 'Live Incident Telemetry Stream Active (35s interval)' : 'Enable Automated Live Incident Telemetry Stream'}
            >
              <Radio className={`w-3.5 h-3.5 ${isTelemetryActive ? 'animate-pulse text-emerald-400' : ''}`} />
              <span className="hidden xl:inline">{isTelemetryActive ? 'Live Stream' : 'Live Off'}</span>
            </button>

            {/* Simulate Single Report Button */}
            <button
              onClick={simulateIncomingReport}
              className="p-2 rounded-xl text-amber-400 hover:bg-slate-800 transition"
              title="Simulate 1 Live Sensor/Citizen Incident Report"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Dark Mode Toggle (Bonus #8) */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-300" />}
            </button>
            
            {/* Report Issue Button */}
            <button
              onClick={() => setIsNewIssueModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-md shadow-sky-600/20 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </button>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-slate-900">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-bold">Smart City Dispatch Alerts</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                        {unreadNotifs.length} new
                      </span>
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            if (n.issueId && onSelectIssue) {
                              const found = issues.find((i) => i.id === n.issueId);
                              if (found) {
                                onSelectIssue(found);
                                setIsNotifOpen(false);
                              }
                            }
                          }}
                          className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                            n.read ? 'opacity-60 bg-white' : 'bg-sky-50/50 font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-slate-900 text-xs">{n.title}</h5>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {formatTimeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-snug">{n.message}</p>
                          {n.issueId && (
                            <span className="inline-block mt-1.5 text-[10px] font-mono font-bold text-sky-600">
                              View Incident #{n.issueId} →
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Database Button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all issues, departments, and users back to pristine GovTech demo state?')) {
                  resetToDefaults();
                }
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Switch Persona Modal Trigger */}
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-sky-400 font-bold transition flex items-center gap-1.5"
              title="Switch Simulated Role"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Switch Role</span>
            </button>

            {/* User Profile Trigger */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              title="View Profile & Security"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-600"
              />
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Auth Sign-in / Register Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Sign In / Register"
            >
              <LogIn className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* New Issue Modal */}
      <NewIssueModal
        isOpen={isNewIssueModalOpen}
        onClose={() => setIsNewIssueModalOpen(false)}
        onSuccess={(id) => {
          const found = issues.find((i) => i.id === id);
          if (found && onSelectIssue) onSelectIssue(found);
        }}
        onViewExistingIssue={(issue) => {
          if (onSelectIssue) onSelectIssue(issue);
        }}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* User Profile & Security Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
