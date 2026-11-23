'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCivicPulse } from '../../../context/CivicPulseContext';
import { Navbar } from '../../../components/Navbar';
import { IssueDetailModal } from '../../../components/IssueDetailModal';
import { ArrowLeft, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function IssueDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { issues } = useCivicPulse();
  const issueId = params?.id as string;

  const issue = issues.find((i) => i.id.toLowerCase() === issueId?.toLowerCase());

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        {issue ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {issue.id}
                </span>
                <h1 className="text-2xl font-bold text-slate-900 mt-2">{issue.title}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Department: <span className="font-semibold text-slate-700">{issue.departmentName}</span> | Location:{' '}
                  <span className="font-semibold text-slate-700">{issue.location.address}</span>
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition"
              >
                Print Official Record
              </button>
            </div>

            {/* Embedded Issue Detail Viewer */}
            <IssueDetailModal issue={issue} onClose={() => router.push('/')} />
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">Infrastructure Issue Not Found</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No record was found matching incident tracking code <span className="font-mono font-bold">{issueId}</span>. It may have been archived or deleted.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow"
            >
              Return to Central Console
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
