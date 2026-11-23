'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home, LifeBuoy } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to telemetry monitoring service
    console.error('CivicPulse Client Error Boundary caught exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            System Error State
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Something unexpected occurred
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The municipal infrastructure telemetry engine encountered an unhandled exception.
            {error?.digest && (
              <span className="block font-mono text-[11px] text-slate-400 mt-1">
                Ref ID: {error.digest}
              </span>
            )}
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left font-mono text-[11px] text-slate-700 overflow-x-auto max-h-32">
            {error.message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-sm shadow-sky-600/20"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
        </div>

        <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <LifeBuoy className="w-3.5 h-3.5" /> CivicPulse 24/7 GovTech Engineering Response
        </p>
      </div>
    </div>
  );
}
