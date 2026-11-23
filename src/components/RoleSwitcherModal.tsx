'use client';

import React from 'react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { UserRole } from '../types';
import { X, Shield, Briefcase, Wrench, User, Check, Sparkles } from 'lucide-react';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, setCurrentUser } = useCivicPulse();

  if (!isOpen) return null;

  const roleProfiles = [
    {
      role: 'ADMIN' as UserRole,
      title: 'Administrator',
      icon: Shield,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'System-wide control: manage departments, users & permissions, analytics, and global SLAs.',
      users: users.filter((u) => u.role === 'ADMIN'),
    },
    {
      role: 'DEPARTMENT_MANAGER' as UserRole,
      title: 'Department Manager',
      icon: Briefcase,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Manage departmental queue: verify citizen reports, set priorities, dispatch staff, approve completion.',
      users: users.filter((u) => u.role === 'DEPARTMENT_MANAGER'),
    },
    {
      role: 'MAINTENANCE_STAFF' as UserRole,
      title: 'Maintenance Staff',
      icon: Wrench,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Field responder: receive task dispatches, update live work status, upload repair photos & labor reports.',
      users: users.filter((u) => u.role === 'MAINTENANCE_STAFF'),
    },
    {
      role: 'CITIZEN' as UserRole,
      title: 'Citizen',
      icon: User,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Public resident: report road, lighting or water problems with GPS, track resolution, and submit feedback.',
      users: users.filter((u) => u.role === 'CITIZEN'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold">Switch Simulated User Role</h3>
              <p className="text-xs text-slate-400">
                Experience CivicPulse from all 4 GovTech stakeholder viewpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profiles Grid */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50">
          {roleProfiles.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.role} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-white shadow-sm border border-slate-200">
                      <Icon className="w-4 h-4 text-slate-700" />
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      {group.title} Role
                    </h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${group.badgeColor}`}>
                    {group.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{group.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {group.users.map((user) => {
                    const isCurrent = currentUser.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUser(user);
                          onClose();
                        }}
                        className={`p-3 rounded-xl border text-left transition flex items-center gap-3 relative ${
                          isCurrent
                            ? 'bg-sky-50 border-sky-600 ring-2 ring-sky-500/30 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {user.name}
                            </span>
                            {isCurrent && (
                              <span className="p-0.5 rounded-full bg-sky-600 text-white shrink-0">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                            {user.assignedZone || 'Department Lead'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Currently logged in: <span className="font-bold text-slate-800">{currentUser.name}</span> ({currentUser.role})
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
