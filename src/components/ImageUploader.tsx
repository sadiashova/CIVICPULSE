'use client';

import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, X, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { validateImageUpload } from '../lib/security';

interface ImageUploaderProps {
  photoUrls?: string[];
  onChange?: (urls: string[]) => void;
  onImagesChange?: (urls: string[]) => void;
  maxFiles?: number;
  presets?: { label: string; url: string }[];
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  photoUrls = [],
  onChange,
  onImagesChange,
  maxFiles = 4,
  presets = [],
}) => {
  const triggerChange = (urls: string[]) => {
    if (onChange) onChange(urls);
    if (onImagesChange) onImagesChange(urls);
  };
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMessage('');
    const validation = validateImageUpload(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid image file.');
      return;
    }

    if (photoUrls.length >= maxFiles) {
      setErrorMessage(`Maximum ${maxFiles} images allowed per report.`);
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        triggerChange([...photoUrls, result]);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      processFile(files[i]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (index: number) => {
    const updated = photoUrls.filter((_, i) => i !== index);
    triggerChange(updated);
  };

  const handleAddPreset = (url: string) => {
    if (photoUrls.length >= maxFiles) {
      setErrorMessage(`Maximum ${maxFiles} images allowed.`);
      return;
    }
    if (!photoUrls.includes(url)) {
      triggerChange([...photoUrls, url]);
    }
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Surface */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-300'
            : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-sky-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-800 block">
            Click to upload or drag & drop photograph
          </span>
          <span className="text-[11px] text-slate-500">
            Supports JPEG, PNG, WEBP (Max 5MB per file • Up to {maxFiles} images)
          </span>
        </div>

        {isProcessing && (
          <span className="text-[11px] text-sky-600 font-semibold animate-pulse">
            Processing image payload...
          </span>
        )}
      </div>

      {/* Validation Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2.5 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Presets Bar */}
      {presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Verified Presets:
          </span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAddPreset(preset.url);
              }}
              className="text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Image Preview Grid */}
      {photoUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {photoUrls.map((url, idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-sm h-24"
            >
              <img
                src={url}
                alt={`Uploaded evidence ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                className="absolute top-1 right-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full p-1 transition shadow"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-1 left-1.5 bg-slate-900/70 text-white text-[9px] font-mono px-1.5 py-0.2 rounded backdrop-blur">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
