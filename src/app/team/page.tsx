'use client';

import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { User, Department } from '../../types';
import {
  Users,
  Wrench,
  Search,
  Building,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Shield,
  Filter,
} from 'lucide-react';

export default function TeamManagementPage() {
  const { users, departments, addUser, addToast } = useCivicPulse();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // New staff form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffDeptId, setNewStaffDeptId] = useState(departments[0]?.id || 'dept-roads');
  const [newStaffZone, setNewStaffZone] = useState('Sector 4 - Downtown');
  const [newStaffSkills, setNewStaffSkills] = useState('Asphalt Repair, Heavy Machinery');

  // Filter maintenance staff
  const staffMembers = users.filter((u) => u.role === 'MAINTENANCE_STAFF');
  const filteredStaff = staffMembers.filter((staff) => {
    const matchesDept = selectedDept === 'ALL' || staff.departmentId === selectedDept;
    const q = search.toLowerCase();
    const matchesSearch =
      staff.name.toLowerCase().includes(q) ||
      staff.email.toLowerCase().includes(q) ||
      (staff.skills && staff.skills.some((s) => s.toLowerCase().includes(q)));
    return matchesDept && matchesSearch;
  });

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    addUser({
      name: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone || '+1 (555) 019-9999',
      role: 'MAINTENANCE_STAFF',
      departmentId: newStaffDeptId,
      assignedZone: newStaffZone,
      status: 'ACTIVE',
      skills: newStaffSkills.split(',').map((s) => s.trim()).filter(Boolean),
      activeTasks: 0,
      completedTasksCount: 0,
    });

    addToast('Staff Member Added', `Technician ${newStaffName} registered to department roster.`, 'SUCCESS');
    setIsAddStaffOpen(false);
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Municipal Field Maintenance Roster
              </h1>
              <span className="text-xs bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold px-2.5 py-0.5 rounded-full border border-sky-300 dark:border-sky-800">
                {staffMembers.length} Certified Technicians
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Field personnel management, real-time workload balancing, certifications, and active dispatch orders.
            </p>
          </div>

          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md shadow-sky-600/20 transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Maintenance Staff</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technician by name, email, or engineering skill..."
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const dept = departments.find((d) => d.id === staff.departmentId);
            const active = staff.activeTasks || 0;
            const completed = staff.completedTasksCount || 0;

            const isHighWorkload = active >= 3;
            const isAvailable = active === 0;

            return (
              <div
                key={staff.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-sky-400 dark:hover:border-sky-500 transition"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={staff.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'}
                    alt={staff.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                        {staff.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : isHighWorkload
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {isAvailable ? 'Available' : `${active} Active Orders`}
                      </span>
                    </div>
                    <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium block truncate">
                      {dept?.name || 'Municipal Infrastructure'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {staff.assignedZone}
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                {staff.skills && staff.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {staff.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Workload Metric Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>Completed: <strong className="text-slate-800 dark:text-slate-200">{completed}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px]">{staff.phone}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Staff Modal */}
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Add Maintenance Technician
                </h3>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Technician Name</label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Samuel Osei"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="staff.technician@civicpulse.gov"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned Department</label>
                  <select
                    value={newStaffDeptId}
                    onChange={(e) => setNewStaffDeptId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={newStaffSkills}
                    onChange={(e) => setNewStaffSkills(e.target.value)}
                    placeholder="e.g. High Voltage Systems, Photocell"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl mt-3 transition"
                >
                  Confirm Staff Registration
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
