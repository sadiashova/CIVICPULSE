'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../../components/Navbar';
import { useCivicPulse } from '../../../context/CivicPulseContext';
import { IssueCategory, IssuePriority, LocationData, Issue } from '../../../types';
import { InteractiveMap } from '../../../components/InteractiveMap';
import { ImageUploader } from '../../../components/ImageUploader';
import { getCategoryLabel } from '../../../lib/utils';
import {
  MapPin,
  Camera,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Hammer,
  Zap,
  Droplet,
  Footprints,
  Trash2,
  Building,
  Sparkles,
  GitMerge,
  ThumbsUp,
} from 'lucide-react';

const CATEGORIES: { id: IssueCategory; label: string; icon: any; color: string; deptId: string }[] = [
  { id: 'ROAD_DAMAGE', label: 'Road Damage', icon: Hammer, color: 'bg-amber-500', deptId: 'dept-roads' },
  { id: 'STREETLIGHT', label: 'Streetlight', icon: Zap, color: 'bg-yellow-500', deptId: 'dept-lighting' },
  { id: 'DRAINAGE', label: 'Drainage', icon: Droplet, color: 'bg-blue-500', deptId: 'dept-water' },
  { id: 'FOOTPATH', label: 'Footpath', icon: Footprints, color: 'bg-purple-500', deptId: 'dept-footpaths' },
  { id: 'WASTE_MANAGEMENT', label: 'Waste Management', icon: Trash2, color: 'bg-emerald-500', deptId: 'dept-waste' },
  { id: 'PUBLIC_INFRASTRUCTURE', label: 'Public Infrastructure', icon: Building, color: 'bg-pink-500', deptId: 'dept-public-infra' },
];

export default function NewIssuePage() {
  const router = useRouter();
  const { reportIssue, findNearbyIssues, upvoteIssue, addToast } = useCivicPulse();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<IssueCategory>('ROAD_DAMAGE');
  const [departmentId, setDepartmentId] = useState('dept-roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [location, setLocation] = useState<LocationData>({
    lat: 40.7412,
    lng: -73.9898,
    address: '450 West Lexington Boulevard',
    landmark: 'Near Lexington Financial Center',
    cityZone: 'Sector 4 - Downtown',
  });
  const [error, setError] = useState('');

  // Automatic duplicate detection
  const nearby = findNearbyIssues(location.lat, location.lng, 300);
  const duplicateMatches = nearby.filter((m) => m.issue.category === category);

  const handleCategorySelect = (catId: IssueCategory, deptId: string) => {
    setCategory(catId);
    setDepartmentId(deptId);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setError('Description must be at least 15 characters long.');
      return;
    }

    const defaultImg =
      photoUrls.length > 0
        ? photoUrls
        : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'];

    const newIssue = reportIssue({
      title,
      description,
      category,
      departmentId,
      priority,
      location,
      photoUrls: defaultImg,
    });

    addToast('Report Submitted', `Ticket #${newIssue.ticketNumber || newIssue.id} lodged successfully.`, 'SUCCESS');
    router.push('/my-reports');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* Wizard Steps Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-xl mx-auto relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
            {[
              { num: 1, label: 'Category' },
              { num: 2, label: 'Location & GPS' },
              { num: 3, label: 'Details & Photos' },
            ].map((s) => (
              <div key={s.num} className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                    step === s.num
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 ring-4 ring-sky-100 dark:ring-sky-950'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="text-center max-w-md mx-auto">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Select Problem Category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your issue will be automatically triaged to the responsible municipal department
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id, cat.deptId)}
                    className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/30 dark:hover:bg-sky-950/20 text-left transition group flex flex-col justify-between h-36"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 group-hover:translate-x-1 transition" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{cat.label}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Municipal Dispatch</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION & GPS + DUPLICATE DETECTION */}
        {step === 2 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Step 2 of 3 • {getCategoryLabel(category)}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Confirm GPS Incident Coordinates
                </h2>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {/* AUTOMATIC DUPLICATE ISSUE DETECTION (Bonus Challenge #2) */}
            {duplicateMatches.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 space-y-2.5 animate-in slide-in-from-top-2">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs text-amber-900 dark:text-amber-200">
                      Automatic Duplicate Detected: {duplicateMatches.length} Similar Open Issue Nearby
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5">
                      Another citizen has already reported a {getCategoryLabel(category)} issue within {duplicateMatches[0].distance} meters.
                      Instead of filing a duplicate, you can endorse this ticket to increase municipal priority!
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-[11px]">
                      {duplicateMatches[0].issue.id}
                    </span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {duplicateMatches[0].issue.title}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {duplicateMatches[0].issue.location.address} • {duplicateMatches[0].distance}m away
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      upvoteIssue(duplicateMatches[0].issue.id);
                      addToast('Endorsement Added', `Upvoted existing ticket #${duplicateMatches[0].issue.id}. Notification subscribed.`, 'SUCCESS');
                      router.push('/my-reports');
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shrink-0"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Upvote Existing Ticket
                  </button>
                </div>
              </div>
            )}

            {/* Interactive Vector GIS Map */}
            <div className="space-y-3">
              <InteractiveMap
                selectedLocation={location}
                onLocationSelect={(loc) => setLocation(loc)}
                interactive={true}
                height="340px"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Detected Address</label>
                  <input
                    type="text"
                    value={location.address}
                    onChange={(e) => setLocation({ ...location, address: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Landmark / Reference</label>
                  <input
                    type="text"
                    value={location.landmark || ''}
                    onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                    placeholder="e.g. Near corner bus stop"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-2.5 px-6 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-600/20 transition"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS & PHOTO UPLOAD */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Step 3 of 3 • {getCategoryLabel(category)}
                </span>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Describe Incident & Attach Proof
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken streetlight luminaire exposing high-voltage cable"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details of the damage, potential hazards to pedestrian or vehicular traffic, and accessibility impact..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Severity Rating
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as IssuePriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="LOW">Low — Non-urgent maintenance</option>
                    <option value="MEDIUM">Medium — Standard municipal turnaround</option>
                    <option value="HIGH">High — Hazardous / Disruption</option>
                    <option value="CRITICAL">Critical — Immediate safety risk</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Department
                  </label>
                  <input
                    type="text"
                    disabled
                    value={CATEGORIES.find((c) => c.id === category)?.label || ''}
                    className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-500"
                  />
                </div>
              </div>

              {/* Multi-Photo Uploader */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Photographic Evidence (Drag & Drop or Preset)
                </label>
                <ImageUploader
                  photoUrls={photoUrls}
                  onChange={(urls) => setPhotoUrls(urls)}
                  maxFiles={4}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
              >
                ← Back to Location
              </button>
              <button
                type="submit"
                className="py-3 px-8 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Official Report</span>
              </button>
            </div>
          </form>
        )}

      </main>
    </div>
  );
}
