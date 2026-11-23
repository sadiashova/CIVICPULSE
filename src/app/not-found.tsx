import React from 'react';
import Link from 'next/link';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            404 — Record Not Found
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            Municipal Route or Resource Not Located
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The requested city infrastructure page, ticket code, or administrative resource does not exist or has been relocated to another sector.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Home className="w-4 h-4" /> Central Hub
          </Link>
          <Link
            href="/issues"
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
          >
            <Search className="w-4 h-4" /> Issue Registry
          </Link>
        </div>
      </div>
    </div>
  );
}
