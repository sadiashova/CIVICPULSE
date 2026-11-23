'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCivicPulse } from '../../../context/CivicPulseContext';
import { Shield, Lock, Mail, User, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { checkPasswordStrength } from '../../../lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useCivicPulse();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [zone, setZone] = useState('Sector 4 - Downtown');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pwdAnalysis = checkPasswordStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pwdAnalysis.score < 2) {
      setError('Please choose a stronger password (minimum 8 characters with numbers/symbols).');
      return;
    }

    setIsLoading(true);
    const res = register({
      name,
      email,
      phone,
      password,
      role: 'CITIZEN',
      assignedZone: zone,
    });
    setIsLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Registration failed.');
    }
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
          Create Citizen Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Report civic infrastructure issues and track real-time repairs
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/80 backdrop-blur-xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya.citizen@example.com"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-8 pr-2 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Primary Zone</label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-sky-500"
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

            <div>
              <label className="block font-bold text-slate-300 mb-1">Secure Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Strength:</span>
                    <span className={`font-bold ${
                      pwdAnalysis.label === 'Strong' ? 'text-emerald-400' : pwdAnalysis.label === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {pwdAnalysis.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        pwdAnalysis.score === 3 ? 'bg-emerald-500 w-full' : pwdAnalysis.score === 2 ? 'bg-amber-500 w-2/3' : 'bg-rose-500 w-1/3'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Citizen Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-700/80">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-sky-400 font-bold hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
