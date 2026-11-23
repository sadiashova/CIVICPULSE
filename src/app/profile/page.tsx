'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useCivicPulse } from '../../context/CivicPulseContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  CheckCircle2,
  Key,
  LogOut,
  Building,
} from 'lucide-react';
import { checkPasswordStrength, formatDate } from '../../lib/utils';

export default function ProfilePage() {
  const { currentUser, updateProfile, changePassword, logout, addToast } = useCivicPulse();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [zone, setZone] = useState(currentUser.assignedZone);

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', isError: false });

  const pwdAnalysis = checkPasswordStrength(newPassword);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      avatar,
      assignedZone: zone,
    });
    addToast('Profile Updated', 'Your profile details were saved successfully.', 'SUCCESS');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg({ text: '', isError: false });

    if (newPassword.length < 8) {
      setPwdMsg({ text: 'Password must be at least 8 characters.', isError: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ text: 'Passwords do not match.', isError: true });
      return;
    }

    changePassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
    setPwdMsg({ text: 'Security credentials updated successfully.', isError: false });
    addToast('Password Changed', 'Security password successfully rotated.', 'SUCCESS');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-700 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentUser.name}
                </h1>
                <span className="text-xs bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Member since {formatDate(currentUser.createdAt)} • ID: {currentUser.id}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Details Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <UserIcon className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Personal Information & Regional Zone
            </h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned City Zone</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Sector 1 - Civic Center">Sector 1 - Civic Center</option>
                  <option value="Sector 2 - East Meadow">Sector 2 - East Meadow</option>
                  <option value="Sector 3 - Medical Corridor">Sector 3 - Medical Corridor</option>
                  <option value="Sector 4 - Downtown">Sector 4 - Downtown</option>
                  <option value="Sector 5 - Transit Hub">Sector 5 - Transit Hub</option>
                  <option value="Sector 6 - University Quarter">Sector 6 - University Quarter</option>
                  <option value="Sector 7 - Waterfront">Sector 7 - Waterfront</option>
                  <option value="Sector 8 - Industrial Park">Sector 8 - Industrial Park</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md transition"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Password & Security Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Password & Authentication Security
            </h3>
          </div>

          {pwdMsg.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              pwdMsg.isError
                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}>
              {pwdMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>
            </div>

            {newPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Strength:</span>
                  <span className={`font-bold ${
                    pwdAnalysis.label === 'Strong' ? 'text-emerald-500' : pwdAnalysis.label === 'Medium' ? 'text-amber-500' : 'text-rose-500'
                  }`}>
                    {pwdAnalysis.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      pwdAnalysis.score === 3 ? 'bg-emerald-500 w-full' : pwdAnalysis.score === 2 ? 'bg-amber-500 w-2/3' : 'bg-rose-500 w-1/3'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* RBAC Permissions Inspector */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Granted RBAC Permission Matrix
            </h3>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {currentUser.permissions && currentUser.permissions.length > 0 ? (
              currentUser.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                >
                  <CheckCircle2 className="w-3 h-3 text-purple-500" />
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Standard citizen privileges.</span>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
