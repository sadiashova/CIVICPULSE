'use client';

import React, { useState } from 'react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { X, User as UserIcon, Mail, Phone, MapPin, Shield, KeyRound, Check, LogOut, CheckCircle2 } from 'lucide-react';
import { checkPasswordStrength } from '../lib/utils';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile, changePassword, logout } = useCivicPulse();

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [assignedZone, setAssignedZone] = useState(currentUser.assignedZone || 'Sector 4 - Downtown');
  const [avatar, setAvatar] = useState(currentUser.avatar);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  if (!isOpen) return null;

  const passwordCheck = checkPasswordStrength(newPassword);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      assignedZone,
      avatar,
    });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    changePassword(newPassword);
    setPasswordSuccess(true);
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src={currentUser.avatar}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <div>
              <h3 className="text-sm font-bold">{currentUser.name}</h3>
              <p className="text-[11px] text-slate-400">
                User Profile & Security Management ({currentUser.role})
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Edit Profile Information */}
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-sky-600" /> Personal Account Details
              </h4>
              {profileSuccess && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Profile Updated
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Full Legal Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Official Email Address:</label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full p-2 border border-slate-200 bg-slate-100 rounded-lg text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Phone Number:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Assigned Civic Sector / Zone:</label>
                <input
                  type="text"
                  value={assignedZone}
                  onChange={(e) => setAssignedZone(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1 text-xs">Avatar Image URL:</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Password Security */}
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" /> Password Security
              </h4>
              {passwordSuccess && (
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Password Changed!
                </span>
              )}
            </div>

            {passwordError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200 font-medium">
                {passwordError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
                {newPassword && (
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Rating: {passwordCheck.feedback}
                  </span>
                )}
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Confirm New Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newPassword || !confirmPassword}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition"
            >
              Update Password
            </button>
          </form>

          {/* Explicit Permissions Matrix */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-600" /> Role-Based Access Permissions (RBAC)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.permissions.map((perm) => (
                <span
                  key={perm}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200"
                >
                  ✓ {perm}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
