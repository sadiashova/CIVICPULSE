'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCivicPulse } from '../../../context/CivicPulseContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle2, User, Sparkles } from 'lucide-react';
import { UserRole } from '../../../types';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchRole } = useCivicPulse();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = login(email, password);
    setIsLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Invalid credentials.');
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight">
            Civic<span className="text-sky-400">Pulse</span>
          </span>
        </Link>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-white">
          Sign In to GovTech Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Access municipal infrastructure triage, field orders, or citizen reports
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/80 backdrop-blur-xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@civicpulse.gov or citizen@example.com"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Role Switcher Demo Presets */}
          <div className="pt-4 border-t border-slate-700/80">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Evaluator Demo Sign-In:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/80 text-purple-300 hover:bg-purple-900 text-left transition"
              >
                <span className="font-bold block">Eleanor Vance</span>
                <span className="text-[10px] text-purple-400">System Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('DEPARTMENT_MANAGER')}
                className="p-2 rounded-xl bg-blue-950/60 border border-blue-800/80 text-blue-300 hover:bg-blue-900 text-left transition"
              >
                <span className="font-bold block">Marcus Brody</span>
                <span className="text-[10px] text-blue-400">Dept Manager</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('MAINTENANCE_STAFF')}
                className="p-2 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 hover:bg-amber-900 text-left transition"
              >
                <span className="font-bold block">Liam Gallagher</span>
                <span className="text-[10px] text-amber-400">Field Crew</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CITIZEN')}
                className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900 text-left transition"
              >
                <span className="font-bold block">Sophia Al-Mansoor</span>
                <span className="text-[10px] text-emerald-400">Citizen</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-sky-400 font-bold hover:underline">
              Register as Citizen
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
