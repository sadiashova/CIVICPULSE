import React from 'react';
import { Loader2, Activity } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 animate-pulse">
            <Activity className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
            CivicPulse Smart City Console
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Synchronizing telemetry & municipal work orders...
          </p>
        </div>
      </div>
    </div>
  );
}
