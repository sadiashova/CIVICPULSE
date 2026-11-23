'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { ManagerDashboard } from '../../components/dashboards/ManagerDashboard';
import { IssueDetailModal } from '../../components/IssueDetailModal';
import { Issue } from '../../types';

export default function DepartmentPage() {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onSelectIssue={(i) => setSelectedIssue(i)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ManagerDashboard onSelectIssue={(i) => setSelectedIssue(i)} />
      </main>

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
}
