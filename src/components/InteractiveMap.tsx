'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Issue, LocationData, IssueCategory } from '../types';
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  AlertTriangle,
  CheckCircle,
  Clock,
  Hammer,
  Zap,
  Droplet,
  Footprints,
  Trash2,
  Building,
  Filter,
  Flame,
} from 'lucide-react';
import { getPriorityStyles, getCategoryLabel, getCategoryColor } from '../lib/utils';

interface InteractiveMapProps {
  issues?: Issue[];
  selectedLocation?: LocationData;
  onLocationSelect?: (loc: LocationData) => void;
  interactive?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onIssueClick?: (issue: Issue) => void;
  filterDepartment?: string;
  filterCategory?: string;
  filterZone?: string;
}

const DEFAULT_CENTER = { lat: 40.7589, lng: -73.9851 };
const KNOWN_ZONES = [
  'Sector 1 - Northern Parklands',
  'Sector 2 - East Meadow',
  'Sector 3 - Medical Corridor',
  'Sector 4 - Downtown',
  'Sector 5 - Transit Hub',
  'Sector 6 - Industrial Bay',
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  issues = [],
  selectedLocation,
  onLocationSelect,
  interactive = true,
  center = DEFAULT_CENTER,
  height = '420px',
  onIssueClick,
  filterDepartment,
  filterCategory,
  filterZone,
}) => {
  const [mapCenter, setMapCenter] = useState(center);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [activePin, setActivePin] = useState<LocationData | null>(selectedLocation || null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [zoneFilter, setZoneFilter] = useState<string>(filterZone || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>(filterCategory || 'ALL');
  const [isHeatmapMode, setIsHeatmapMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedLocation) {
      setActivePin(selectedLocation);
      setMapCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [selectedLocation]);

  // Coordinate projection to container pixel percentages
  const latSpan = 0.08 / Math.pow(1.3, zoomLevel - 13);
  const lngSpan = 0.12 / Math.pow(1.3, zoomLevel - 13);

  const getCoordinatesPosition = (lat: number, lng: number) => {
    const x = ((lng - (mapCenter.lng - lngSpan / 2)) / lngSpan) * 100;
    const y = (((mapCenter.lat + latSpan / 2) - lat) / latSpan) * 100;
    return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onLocationSelect || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const clickedLng = (mapCenter.lng - lngSpan / 2) + clickX * lngSpan;
    const clickedLat = (mapCenter.lat + latSpan / 2) - clickY * latSpan;

    const streetNames = ['Grand Avenue', 'Civic Center Way', 'Lexington Blvd', 'Roosevelt Expressway', 'Meadow St', 'Liberty Parkway', 'Industrial Blvd'];
    const randomStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
    const randomNum = Math.floor(100 + Math.random() * 899);

    const newLoc: LocationData = {
      lat: Number(clickedLat.toFixed(5)),
      lng: Number(clickedLng.toFixed(5)),
      address: `${randomNum} ${randomStreet}`,
      landmark: 'Near public utility grid',
      cityZone: clickedLat > 40.76 ? KNOWN_ZONES[0] : KNOWN_ZONES[3],
    };

    setActivePin(newLoc);
    onLocationSelect(newLoc);
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: LocationData = {
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            address: 'GPS Verified Location (Field Device)',
            landmark: 'Satellite Geolocation Detected',
            cityZone: 'Sector 4 - Downtown',
          };
          setActivePin(loc);
          setMapCenter({ lat: loc.lat, lng: loc.lng });
          if (onLocationSelect) onLocationSelect(loc);
          setIsLocating(false);
        },
        () => {
          const loc: LocationData = {
            lat: 40.7589,
            lng: -73.9851,
            address: 'Central Municipal Plaza, Sector 4',
            landmark: 'City Hall North Gate',
            cityZone: 'Sector 4 - Downtown',
          };
          setActivePin(loc);
          setMapCenter({ lat: loc.lat, lng: loc.lng });
          if (onLocationSelect) onLocationSelect(loc);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Filter issues
  const filteredIssues = issues.filter((i) => {
    const matchesDept = !filterDepartment || i.departmentId === filterDepartment;
    const matchesCat =
      categoryFilter === 'ALL' ||
      i.category === categoryFilter ||
      (categoryFilter === 'WASTE_MANAGEMENT' && (i.category === 'WASTE' || i.category === 'WASTE_MANAGEMENT')) ||
      (categoryFilter === 'PUBLIC_INFRASTRUCTURE' && (i.category === 'PUBLIC_INFRA' || i.category === 'PUBLIC_INFRASTRUCTURE'));
    const matchesZone = zoneFilter === 'ALL' || i.location.cityZone.includes(zoneFilter);
    return matchesDept && matchesCat && matchesZone;
  });

  // Area-wise issue distribution counts
  const zoneDistribution = KNOWN_ZONES.map((zoneName) => ({
    name: zoneName.split(' - ')[1] || zoneName,
    fullName: zoneName,
    count: issues.filter((i) => i.location.cityZone === zoneName).length,
  }));

  // Category Icon Renderer
  const renderCategoryIcon = (cat: IssueCategory) => {
    switch (cat) {
      case 'ROAD_DAMAGE':
        return <Hammer className="w-3.5 h-3.5 text-white" />;
      case 'STREETLIGHT':
        return <Zap className="w-3.5 h-3.5 text-white" />;
      case 'DRAINAGE':
        return <Droplet className="w-3.5 h-3.5 text-white" />;
      case 'FOOTPATH':
        return <Footprints className="w-3.5 h-3.5 text-white" />;
      case 'WASTE_MANAGEMENT':
      case 'WASTE':
        return <Trash2 className="w-3.5 h-3.5 text-white" />;
      case 'PUBLIC_INFRASTRUCTURE':
      case 'PUBLIC_INFRA':
        return <Building className="w-3.5 h-3.5 text-white" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-white" />;
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner bg-slate-900 select-none">
      
      {/* Zone Distribution Bar Overlay */}
      <div className="bg-slate-950/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500">Area Density:</span>
          {zoneDistribution.map((z, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setZoneFilter(zoneFilter === z.fullName ? 'ALL' : z.fullName)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                zoneFilter === z.fullName
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <span>{z.name}</span>
              <span className="font-bold text-sky-400">({z.count})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-[11px] px-2 py-1 text-slate-200"
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
      </div>

      {/* City Map Surface */}
      <div
        ref={containerRef}
        onClick={handleMapClick}
        style={{ height }}
        className={`w-full relative overflow-hidden ${interactive ? 'cursor-crosshair' : 'cursor-default'}`}
      >
        <div 
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 80%),
              linear-gradient(to right, #0f172a 1px, transparent 1px),
              linear-gradient(to bottom, #0f172a 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 36px 36px, 36px 36px',
            backgroundColor: '#0a0f1d',
          }}
        />

        {/* Visual Road Arterials Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="45%" x2="100%" y2="55%" stroke="#38bdf8" strokeWidth="6" strokeDasharray="12 4" />
          <line x1="30%" y1="0" x2="45%" y2="100%" stroke="#38bdf8" strokeWidth="5" />
          <line x1="70%" y1="0" x2="65%" y2="100%" stroke="#1e293b" strokeWidth="8" />
          <line x1="0" y1="80%" x2="100%" y2="20%" stroke="#334155" strokeWidth="4" />
          <path d="M 0,25 Q 250,90 500,40 T 1000,120" fill="none" stroke="#0284c7" strokeWidth="18" opacity="0.3" />
        </svg>

        {/* Heatmap Layer (Bonus Challenge #3) */}
        {isHeatmapMode && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden mix-blend-screen opacity-90 transition-opacity duration-500">
            {filteredIssues.map((issue) => {
              const pos = getCoordinatesPosition(issue.location.lat, issue.location.lng);
              const isCritical = issue.priority === 'CRITICAL';
              const isHigh = issue.priority === 'HIGH';
              const size = isCritical ? 140 : isHigh ? 100 : 70;
              const color = isCritical
                ? 'radial-gradient(circle, rgba(244, 63, 94, 0.75) 0%, rgba(249, 115, 22, 0.45) 45%, rgba(234, 179, 8, 0.2) 70%, transparent 100%)'
                : isHigh
                ? 'radial-gradient(circle, rgba(249, 115, 22, 0.7) 0%, rgba(234, 179, 8, 0.4) 50%, rgba(59, 130, 246, 0.15) 75%, transparent 100%)'
                : 'radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, rgba(14, 165, 233, 0.3) 50%, transparent 100%)';

              return (
                <div
                  key={`heat-${issue.id}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: color,
                    transform: 'translate(-50%, -50%)',
                    filter: 'blur(8px)',
                  }}
                  className="absolute rounded-full pointer-events-none animate-pulse"
                />
              );
            })}
          </div>
        )}

        {/* Category-Specific Map Markers */}
        {filteredIssues.map((issue) => {
          const pos = getCoordinatesPosition(issue.location.lat, issue.location.lng);
          const isCritical = issue.priority === 'CRITICAL';
          const catColor = getCategoryColor(issue.category);

          return (
            <div
              key={issue.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIssue(issue);
                if (onIssueClick) onIssueClick(issue);
              }}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group z-20 transition-transform duration-200 hover:scale-125"
            >
              {isCritical && (
                <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
              )}
              <div
                style={{ backgroundColor: catColor }}
                className="flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white text-white font-bold"
                title={`${issue.id}: ${issue.title} (${getCategoryLabel(issue.category)})`}
              >
                {issue.status === 'RESOLVED' || issue.status === 'CLOSED' ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  renderCategoryIcon(issue.category)
                )}
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:flex flex-col bg-slate-900/95 text-white text-[11px] rounded-lg py-1.5 px-2.5 shadow-2xl border border-slate-700 pointer-events-none whitespace-nowrap z-30">
                <span className="font-semibold text-sky-400">{issue.id} • {getCategoryLabel(issue.category)}</span>
                <span className="font-medium truncate max-w-[180px]">{issue.title}</span>
                <span className="text-slate-400 text-[10px]">{issue.location.address}</span>
              </div>
            </div>
          );
        })}

        {/* User Selected Pin */}
        {activePin && (
          <div
            style={{
              left: `${getCoordinatesPosition(activePin.lat, activePin.lng).x}%`,
              top: `${getCoordinatesPosition(activePin.lat, activePin.lng).y}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-full z-30 cursor-pointer animate-bounce"
          >
            <div className="relative flex flex-col items-center">
              <div className="bg-sky-500 text-white p-2 rounded-full shadow-2xl border-2 border-white ring-4 ring-sky-400/40">
                <MapPin className="w-6 h-6 fill-white" />
              </div>
              <div className="w-2 h-2 bg-sky-600 rounded-full mt-0.5" />
            </div>
          </div>
        )}

        {/* Selected Issue Preview Card */}
        {selectedIssue && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-700 shadow-2xl z-40"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-400/30 mb-1">
                  {selectedIssue.id} • {getCategoryLabel(selectedIssue.category)}
                </span>
                <h4 className="font-semibold text-xs leading-snug line-clamp-2">{selectedIssue.title}</h4>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="truncate">{selectedIssue.location.address}</span>
            </p>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getPriorityStyles(selectedIssue.priority).badge}`}>
                {selectedIssue.priority} Priority
              </span>
              {onIssueClick && (
                <button
                  onClick={() => onIssueClick(selectedIssue)}
                  className="text-[11px] font-medium text-sky-400 hover:text-sky-300 underline"
                >
                  View Details →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.min(18, z + 1));
            }}
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white shadow-lg border border-slate-700 backdrop-blur"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomLevel((z) => Math.max(10, z - 1));
            }}
            className="p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white shadow-lg border border-slate-700 backdrop-blur"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {interactive && onLocationSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLocateMe();
              }}
              disabled={isLocating}
              className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-lg border border-sky-400 backdrop-blur"
              title="Locate My GPS Coordinates"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Heatmap Toggle Button (Bonus #3) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsHeatmapMode(!isHeatmapMode);
            }}
            className={`p-2 rounded-lg text-white shadow-lg border transition backdrop-blur flex items-center justify-center ${
              isHeatmapMode
                ? 'bg-rose-600 border-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400'
                : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title={isHeatmapMode ? 'Disable Heatmap View' : 'Enable Heatmap Density Visualization'}
          >
            <Flame className="w-4 h-4" />
          </button>
        </div>

        {/* Legend & Thermal Indicator */}
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md rounded-lg px-2.5 py-1.5 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none z-20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-100">GIS Telemetry</span>
          <span className="text-slate-500">|</span>
          <span>{filteredIssues.length} Incidents</span>
          {isHeatmapMode && (
            <span className="ml-1 text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Heatmap Active
            </span>
          )}
        </div>

        {interactive && onLocationSelect && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-500/50 shadow-xl text-sky-300 text-xs font-medium pointer-events-none z-20 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 animate-bounce text-sky-400" />
            Click anywhere on map to pin coordinates
          </div>
        )}
      </div>

      {/* Selected Coordinate Footer Info */}
      {activePin && (
        <div className="bg-slate-950/90 px-4 py-2 text-xs border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sky-400">Selected Pin:</span>
            <span>{activePin.address}</span>
            <span className="text-slate-500">({activePin.cityZone})</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            GPS: {activePin.lat.toFixed(5)}° N, {activePin.lng.toFixed(5)}° W
          </div>
        </div>
      )}
    </div>
  );
};
