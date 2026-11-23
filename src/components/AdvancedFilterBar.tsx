'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ArrowUpDown, X, RotateCcw } from 'lucide-react';
import { IssueCategory, IssuePriority, IssueStatus, Department } from '../types';
import { useDebounce } from '../hooks/useDebounce';

export interface FilterState {
  search: string;
  category: string;
  departmentId: string;
  priority: string;
  status: string;
  startDate: string;
  endDate: string;
  sortBy: 'createdAt' | 'priority' | 'slaDeadline' | 'upvotes';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFilterBarProps {
  departments: Department[];
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  departments,
  filters,
  onChange,
  onReset,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const handleDatePreset = (preset: 'today' | '7days' | '30days' | 'all') => {
    const now = new Date();
    if (preset === 'all') {
      onChange({ ...filters, startDate: '', endDate: '' });
      return;
    }
    const end = now.toISOString();
    let start = '';
    if (preset === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      start = today.toISOString();
    } else if (preset === '7days') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (preset === '30days') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    onChange({ ...filters, startDate: start, endDate: end });
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      
      {/* Top Search & Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        
        {/* Debounced Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by ID, title, physical address, or citizen..."
            className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onChange({ ...filters, search: '' });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filters.priority}
            onChange={(e) => onChange({ ...filters, priority: e.target.value })}
            className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">🔴 Critical Priority</option>
            <option value="HIGH">🟠 High Priority</option>
            <option value="MEDIUM">🔵 Medium Priority</option>
            <option value="LOW">⚪ Low Priority</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value })}
            className="w-full py-2.5 px-3 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">1. Submitted</option>
            <option value="UNDER_REVIEW">2. Under Review</option>
            <option value="ASSIGNED">3. Assigned</option>
            <option value="IN_PROGRESS">4. In Progress</option>
            <option value="RESOLVED">5. Resolved</option>
            <option value="CLOSED">6. Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

      </div>

      {/* Secondary Row: Category, Department, Date Range & Sorting */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
        
        {/* Category Filter */}
        <div>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD_DAMAGE">Road Damage</option>
            <option value="STREETLIGHT">Streetlight</option>
            <option value="DRAINAGE">Drainage</option>
            <option value="FOOTPATH">Footpath</option>
            <option value="WASTE_MANAGEMENT">Waste Management</option>
            <option value="PUBLIC_INFRASTRUCTURE">Public Infrastructure</option>
          </select>
        </div>

        {/* Department Filter */}
        <div>
          <select
            value={filters.departmentId}
            onChange={(e) => onChange({ ...filters, departmentId: e.target.value })}
            className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Sort By Field */}
        <div className="flex items-center gap-1.5">
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full p-2 border border-slate-300 rounded-xl bg-white text-xs"
          >
            <option value="createdAt">Sort by Date Filed</option>
            <option value="priority">Sort by Priority Severity</option>
            <option value="slaDeadline">Sort by SLA Deadline</option>
            <option value="upvotes">Sort by Upvotes</option>
          </select>

          <button
            type="button"
            onClick={() => onChange({ ...filters, sortOrder: filters.sortOrder === 'desc' ? 'asc' : 'desc' })}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 transition shrink-0"
            title={filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>

        {/* Date Range Quick Presets & Reset */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-1">
            <button
              type="button"
              onClick={() => handleDatePreset('all')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                !filters.startDate ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('today')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-white"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('7days')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-white"
            >
              7d
            </button>
            <button
              type="button"
              onClick={() => handleDatePreset('30days')}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-white"
            >
              30d
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-600 transition shrink-0"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
