'use client';

import React, { useState, useEffect } from 'react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { IssueCategory, IssuePriority, LocationData, Issue } from '../types';
import {
  X,
  MapPin,
  Camera,
  AlertTriangle,
  Send,
  CheckCircle,
  Hammer,
  Zap,
  Droplet,
  Footprints,
  Trash2,
  Building,
  ThumbsUp,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { ImageUploader } from './ImageUploader';
import { validateCoordinates, sanitizeInput } from '../lib/security';

interface NewIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (issueId: string) => void;
  onViewExistingIssue?: (issue: Issue) => void;
}

const CATEGORIES: {
  id: IssueCategory;
  label: string;
  icon: any;
  deptId: string;
  description: string;
}[] = [
  {
    id: 'ROAD_DAMAGE',
    label: 'Road Damage',
    icon: Hammer,
    deptId: 'dept-roads',
    description: 'Potholes, asphalt cracks, sunken pavement, or road craters.',
  },
  {
    id: 'STREETLIGHT',
    label: 'Streetlight',
    icon: Zap,
    deptId: 'dept-lighting',
    description: 'Blacked-out streetlights, exposed base wiring, or flickering fixtures.',
  },
  {
    id: 'DRAINAGE',
    label: 'Drainage',
    icon: Droplet,
    deptId: 'dept-water',
    description: 'Choked storm grates, flash flooding, culvert debris, or sewer backup.',
  },
  {
    id: 'FOOTPATH',
    label: 'Footpath',
    icon: Footprints,
    deptId: 'dept-footpaths',
    description: 'Broken sidewalk slabs, missing curb ramps, or hazardous tripping pits.',
  },
  {
    id: 'WASTE_MANAGEMENT',
    label: 'Waste Management',
    icon: Trash2,
    deptId: 'dept-waste',
    description: 'Illegal toxic dumping, overflowing municipal bins, or biohazard waste.',
  },
  {
    id: 'PUBLIC_INFRASTRUCTURE',
    label: 'Public Infrastructure',
    icon: Building,
    deptId: 'dept-public-infra',
    description: 'Damaged bus stops, footbridges, guardrails, or park barriers.',
  },
];

const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Road Crater',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Damaged Lamppost',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Drainage Flood',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Sidewalk Cave-in',
    url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Illegal Dumping',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Damaged Bridge Handrail',
    url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
  },
];

export const NewIssueModal: React.FC<NewIssueModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onViewExistingIssue,
}) => {
  const { reportIssue, currentUser, findNearbyIssues, upvoteIssue } = useCivicPulse();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [category, setCategory] = useState<IssueCategory>('ROAD_DAMAGE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  
  // Location
  const [location, setLocation] = useState<LocationData>({
    address: '450 Civic Center Way, Sector 4',
    landmark: 'Outside City Library South Steps',
    lat: 40.7589,
    lng: -73.9851,
    cityZone: 'Sector 4 - Downtown',
  });

  // Photos
  const [photoUrls, setPhotoUrls] = useState<string[]>([SAMPLE_PHOTO_PRESETS[0].url]);

  // Form Validation Errors State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Duplicate detection state
  const [detectedDuplicates, setDetectedDuplicates] = useState<{ issue: Issue; distance: number }[]>([]);

  useEffect(() => {
    if (location.lat && location.lng) {
      const nearby = findNearbyIssues(location.lat, location.lng, 350);
      setDetectedDuplicates(nearby);
    }
  }, [location.lat, location.lng]);

  if (!isOpen) return null;

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) {
      errors.title = 'Title is required.';
    } else if (title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors: Record<string, string> = {};
    if (!location.address.trim()) {
      errors.address = 'Street address is required.';
    }
    const coordValidation = validateCoordinates(location.lat, location.lng);
    if (!coordValidation.valid) {
      errors.gps = coordValidation.error || 'Invalid GPS coordinates.';
    }
    if (photoUrls.length === 0) {
      errors.photos = 'Please upload or select at least one photograph of the infrastructure problem.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors: Record<string, string> = {};
    if (!description.trim()) {
      errors.description = 'Detailed description is required.';
    } else if (description.trim().length < 15) {
      errors.description = 'Please provide at least 15 characters of descriptive detail.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newIssue = reportIssue({
        title: sanitizeInput(title) || `${selectedCategoryObj.label} Issue at ${location.address}`,
        description: sanitizeInput(description),
        category,
        departmentId: selectedCategoryObj.deptId,
        priority,
        location: {
          ...location,
          address: sanitizeInput(location.address),
          landmark: location.landmark ? sanitizeInput(location.landmark) : undefined,
        },
        photoUrls,
      });

      setIsSubmitting(false);
      setSubmittedId(newIssue.id);
      if (onSuccess) onSuccess(newIssue.id);
    }, 400);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setFieldErrors({});
    setSubmittedId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold">Report Public Infrastructure Problem</h2>
              <p className="text-xs text-slate-400">
                Reporter: {currentUser.name} ({currentUser.email})
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {!submittedId && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                1
              </span>
              <span className={`font-semibold ${step === 1 ? 'text-sky-700' : 'text-slate-500'}`}>
                Category & Hazard
              </span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                2
              </span>
              <span className={`font-semibold ${step === 2 ? 'text-sky-700' : 'text-slate-500'}`}>
                GPS & Photographs
              </span>
            </div>
            <div className="h-0.5 w-12 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  step === 3 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                3
              </span>
              <span className={`font-semibold ${step === 3 ? 'text-sky-700' : 'text-slate-500'}`}>
                Review & Confirm
              </span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {submittedId ? (
            /* Submission Success Screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Infrastructure Issue Successfully Logged!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Assigned Tracking ID:{' '}
                <span className="font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {submittedId}
                </span>{' '}
                and routed to <span className="font-semibold text-slate-800">{selectedCategoryObj.label}</span> triage queue.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800">{selectedCategoryObj.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-semibold text-slate-800">{location.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono text-slate-700">{location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reporter:</span>
                  <span className="font-semibold text-slate-800">{currentUser.name} ({currentUser.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Status:</span>
                  <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-0.2 rounded">Submitted</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg transition"
                >
                  Return to Dashboard & Track Resolution
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* STEP 1: CATEGORY & HAZARD */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                      Select Infrastructure Category:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setCategory(cat.id);
                              const match = SAMPLE_PHOTO_PRESETS.find(p => p.label.toLowerCase().includes(cat.label.toLowerCase().slice(0, 4)));
                              if (match) setPhotoUrls([match.url]);
                            }}
                            className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                              isSelected
                                ? 'border-sky-600 bg-sky-50/70 shadow-sm ring-2 ring-sky-500/20'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <span
                              className={`p-2 rounded-lg shrink-0 ${
                                isSelected ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-slate-800">{cat.label}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {cat.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Problem Title / Short Summary:
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
                      }}
                      placeholder={`e.g., Deep pothole endangering vehicles on Main St`}
                      className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-2 ${
                        fieldErrors.title
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                          : 'border-slate-300 focus:ring-sky-500'
                      }`}
                    />
                    {fieldErrors.title && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.title}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Urgency / Perceived Hazard Level:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as IssuePriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition ${
                            priority === p
                              ? p === 'CRITICAL'
                                ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400/30'
                                : p === 'HIGH'
                                ? 'bg-orange-500 text-white border-orange-500 ring-2 ring-orange-400/30'
                                : p === 'MEDIUM'
                                ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400/30'
                                : 'bg-slate-700 text-white border-slate-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: GPS MAP & PHOTO UPLOAD WITH DUPLICATE DETECTION */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Duplicate Alert Banner if nearby issue found */}
                  {detectedDuplicates.length > 0 && (
                    <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-amber-900 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Possible Duplicate Incident Detected Nearby!</span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        An active municipal issue was already logged within{' '}
                        <span className="font-bold">{detectedDuplicates[0].distance} meters</span> of this spot:
                      </p>
                      <div className="p-2.5 bg-white rounded-lg border border-amber-200 flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-sky-700">{detectedDuplicates[0].issue.id}</span>
                          <span className="text-slate-800 font-semibold block">{detectedDuplicates[0].issue.title}</span>
                          <span className="text-[10px] text-slate-400">{detectedDuplicates[0].issue.location.address}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            upvoteIssue(detectedDuplicates[0].issue.id);
                            if (onViewExistingIssue) {
                              onViewExistingIssue(detectedDuplicates[0].issue);
                              onClose();
                            }
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-[11px] rounded-lg flex items-center gap-1 shadow-sm shrink-0"
                        >
                          <ThumbsUp className="w-3 h-3" /> Upvote Existing Issue
                        </button>
                      </div>
                      <span className="text-[10px] text-amber-700 block italic">
                        Tip: You can proceed if this is a separate incident.
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        Pin Exact GPS Location on Map:
                      </label>
                      <span className="text-[11px] text-slate-500">
                        Click on map or auto-detect GPS
                      </span>
                    </div>

                    <InteractiveMap
                      selectedLocation={location}
                      onLocationSelect={(loc) => setLocation(loc)}
                      interactive={true}
                      height="200px"
                    />
                    {fieldErrors.gps && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                        {fieldErrors.gps}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Street Address:</label>
                      <input
                        type="text"
                        value={location.address}
                        onChange={(e) => setLocation({ ...location, address: e.target.value })}
                        className={`w-full p-2 border rounded-lg text-xs ${
                          fieldErrors.address ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                        }`}
                        required
                      />
                      {fieldErrors.address && (
                        <span className="text-[10px] text-rose-600 font-medium mt-0.5 block">{fieldErrors.address}</span>
                      )}
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Landmark Description:</label>
                      <input
                        type="text"
                        value={location.landmark || ''}
                        onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                        placeholder="e.g. Opposite Metro Gate 3"
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Drag and Drop Image Uploader Component */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Upload Incident Photographs:
                    </label>
                    <ImageUploader
                      photoUrls={photoUrls}
                      onChange={(urls) => {
                        setPhotoUrls(urls);
                        if (fieldErrors.photos) setFieldErrors({ ...fieldErrors, photos: '' });
                      }}
                      maxFiles={4}
                      presets={SAMPLE_PHOTO_PRESETS}
                    />
                    {fieldErrors.photos && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 block">
                        {fieldErrors.photos}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & CONFIRM */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-1">
                      Detailed Citizen Description:
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
                      }}
                      placeholder="Please describe the extent of damage, hazard risks to pedestrians/vehicles, and when you first noticed it..."
                      rows={3}
                      className={`w-full text-xs p-2.5 rounded-lg border focus:outline-none focus:ring-2 ${
                        fieldErrors.description
                          ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                          : 'border-slate-300 focus:ring-sky-500'
                      }`}
                      required
                    />
                    {fieldErrors.description && (
                      <span className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldErrors.description}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
                      Report Metadata & Dispatch Verification
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Category</span>
                        <span className="font-semibold text-slate-800">{selectedCategoryObj.label}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Priority</span>
                        <span className="font-semibold text-amber-600">{priority}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Reporter</span>
                        <span className="font-semibold text-slate-800">{currentUser.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase">Contact Phone</span>
                        <span className="font-semibold text-slate-800">{currentUser.phone}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase">Location & GPS</span>
                        <span className="font-semibold text-slate-800 block truncate">{location.address}</span>
                        <span className="font-mono text-[10px] text-slate-500">
                          {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° W ({location.cityZone})
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase">Attachments</span>
                        <span className="font-semibold text-slate-800">{photoUrls.length} Photographic Evidences</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step Navigation Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as any)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {step === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Step 2: Location & Photos →
                  </button>
                )}

                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep2()) setStep(3);
                    }}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Step 3: Review & Submit →
                  </button>
                )}

                {step === 3 && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? 'Validating & Routing...' : 'Submit Issue to Department'}
                  </button>
                )}
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
