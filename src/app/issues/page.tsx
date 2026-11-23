'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { Navbar } from '../../components/Navbar';
import { IssueDetailModal } from '../../components/IssueDetailModal';
import { AdvancedFilterBar, FilterState } from '../../components/AdvancedFilterBar';
import { Issue, IssuePriority } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  formatDate,
  formatTimeAgo,
  getPriorityStyles,
  getStatusStyles,
  getCategoryLabel,
  getSlaRemaining,
} from '../../lib/utils';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  category: 'ALL',
  departmentId: 'ALL',
  priority: 'ALL',
  status: 'ALL',
  startDate: '',
  endDate: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export default function AllIssuesPage() {
  const { issues, departments } = useCivicPulse();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Filter & Sort Logic
  const filteredAndSortedIssues = useMemo(() => {
    let list = [...issues];

    // Search query (debounced)
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.address.toLowerCase().includes(q) ||
          i.citizenName.toLowerCase().includes(q) ||
          (i.assignedStaffName && i.assignedStaffName.toLowerCase().includes(q))
      );
    }

    // Category
    if (filters.category !== 'ALL') {
      list = list.filter((i) => 
        i.category === filters.category ||
        (filters.category === 'WASTE_MANAGEMENT' && (i.category === 'WASTE' || i.category === 'WASTE_MANAGEMENT')) ||
        (filters.category === 'PUBLIC_INFRASTRUCTURE' && (i.category === 'PUBLIC_INFRA' || i.category === 'PUBLIC_INFRASTRUCTURE'))
      );
    }

    // Department
    if (filters.departmentId !== 'ALL') {
      list = list.filter((i) => i.departmentId === filters.departmentId);
    }

    // Priority
    if (filters.priority !== 'ALL') {
      list = list.filter((i) => i.priority === filters.priority);
    }

    // Status
    if (filters.status !== 'ALL') {
      list = list.filter((i) => i.status === filters.status);
    }

    // Date range
    if (filters.startDate) {
      list = list.filter((i) => new Date(i.createdAt) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      list = list.filter((i) => new Date(i.createdAt) <= new Date(filters.endDate));
    }

    // Sorting
    list.sort((a, b) => {
      let valA: any = a[filters.sortBy] ?? '';
      let valB: any = b[filters.sortBy] ?? '';

      if (filters.sortBy === 'priority') {
        const orderMap: Record<IssuePriority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        valA = orderMap[a.priority] || 0;
        valB = orderMap[b.priority] || 0;
      }

      if (valA < valB) return filters.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [issues, filters]);

  // Paginated Slice
  const totalItems = filteredAndSortedIssues.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedIssues = filteredAndSortedIssues.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleFilterChange = (newFilters: FilterState) => {
    setIsLoading(true);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page
    setTimeout(() => setIsLoading(false), 150);
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 150);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar onSelectIssue={(iss) => setSelectedIssue(iss)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Smart City Issues Repository</h1>
            <p className="text-xs text-slate-500">
              Advanced multi-attribute search, debounced filtering, and municipal incident telemetry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 text-white shadow-sm">
              {totalItems} Matching Issues
            </span>
          </div>
        </div>

        {/* Advanced Filter & Sorting Component */}
        <AdvancedFilterBar
          departments={departments}
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Error State */}
        {hasError && (
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-sm font-bold text-rose-900">Failed to load issues query</h3>
            <p className="text-xs text-rose-700">An unexpected data stream error occurred. Please retry.</p>
            <button
              onClick={() => setHasError(false)}
              className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg shadow"
            >
              Retry Query
            </button>
          </div>
        )}

        {/* Loading State Skeleton */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((sk) => (
              <div key={sk} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-48 h-3 bg-slate-200 rounded" />
                    <div className="w-72 h-4 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State or Results List */
          <div className="space-y-3">
            {paginatedIssues.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No issues found matching query</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search keywords, broadening the date range, or resetting filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              paginatedIssues.map((issue) => {
                const pStyles = getPriorityStyles(issue.priority);
                const sStyles = getStatusStyles(issue.status);
                const sla = getSlaRemaining(issue.slaDeadline, issue.status);

                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative">
                        {issue.photoUrls.length > 0 ? (
                          <img src={issue.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-[10px]">No img</div>
                        )}
                        <span className={`absolute bottom-0 inset-x-0 h-1.5 ${pStyles.solid}`} />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.2 rounded border border-sky-200">
                            {issue.id}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${pStyles.badge}`}>
                            {issue.priority}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${sStyles.badge}`}>
                            {sStyles.label}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {getCategoryLabel(issue.category)}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 truncate">{issue.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{issue.location.address} ({issue.location.cityZone})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className={`text-[11px] font-semibold flex items-center gap-1 justify-end ${
                          sla.isBreached ? 'text-rose-600 font-bold animate-pulse' : 'text-slate-600'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {sla.text}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Reported: {formatDate(issue.createdAt)}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue);
                        }}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Inspect →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <span>Showing</span>
              <span className="font-bold text-slate-800">
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)}
              </span>
              <span>of</span>
              <span className="font-bold text-slate-800">{totalItems}</span>
              <span>issues</span>

              <span className="mx-2 text-slate-300">|</span>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 border border-slate-300 rounded-lg bg-white font-bold"
              >
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition ${
                    currentPage === pg
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-40 transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      <IssueDetailModal
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </div>
  );
}
