'use client';

import React from 'react';
import { Navbar } from '../../components/Navbar';
import { AnalyticsDashboard } from '../../components/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
