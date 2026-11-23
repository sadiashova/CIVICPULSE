import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { IssuePriority, IssueStatus, IssueCategory, UserRole, UserPermission } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function getSlaRemaining(slaDeadline?: string, status?: IssueStatus): {
  text: string;
  isBreached: boolean;
  hoursRemaining: number;
} {
  if (!slaDeadline || status === 'RESOLVED' || status === 'CLOSED' || status === 'REJECTED') {
    return { text: 'Completed', isBreached: false, hoursRemaining: 999 };
  }

  const now = new Date().getTime();
  const deadline = new Date(slaDeadline).getTime();
  const diffMs = deadline - now;
  const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));

  if (diffMs <= 0) {
    const overdueHours = Math.abs(hoursRemaining);
    return {
      text: `SLA Breached (${overdueHours}h overdue)`,
      isBreached: true,
      hoursRemaining,
    };
  }

  if (hoursRemaining < 1) {
    const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return {
      text: `${mins}m remaining`,
      isBreached: false,
      hoursRemaining: 0.5,
    };
  }

  return {
    text: `${hoursRemaining}h remaining`,
    isBreached: false,
    hoursRemaining,
  };
}

export function getCategoryLabel(category: IssueCategory): string {
  const map: Record<IssueCategory, string> = {
    ROAD_DAMAGE: 'Road Damage',
    STREETLIGHT: 'Streetlight',
    DRAINAGE: 'Drainage',
    FOOTPATH: 'Footpath',
    WASTE_MANAGEMENT: 'Waste Management',
    PUBLIC_INFRASTRUCTURE: 'Public Infrastructure',
    WASTE: 'Waste Management',
    PUBLIC_INFRA: 'Public Infrastructure',
  };
  return map[category] || category;
}

export function getCategoryColor(category: IssueCategory): string {
  switch (category) {
    case 'ROAD_DAMAGE':
      return '#f59e0b'; // Amber
    case 'STREETLIGHT':
      return '#eab308'; // Yellow
    case 'DRAINAGE':
      return '#0284c7'; // Sky/Blue
    case 'FOOTPATH':
      return '#8b5cf6'; // Purple
    case 'WASTE_MANAGEMENT':
    case 'WASTE':
      return '#10b981'; // Emerald
    case 'PUBLIC_INFRASTRUCTURE':
    case 'PUBLIC_INFRA':
      return '#ec4899'; // Pink
    default:
      return '#64748b';
  }
}

export function getPriorityStyles(priority: IssuePriority) {
  switch (priority) {
    case 'CRITICAL':
      return {
        badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
        dot: 'bg-rose-500 animate-ping',
        solid: 'bg-rose-600 text-white',
        border: 'border-rose-400',
      };
    case 'HIGH':
      return {
        badge: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300',
        dot: 'bg-orange-500',
        solid: 'bg-orange-600 text-white',
        border: 'border-orange-400',
      };
    case 'MEDIUM':
      return {
        badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300',
        dot: 'bg-blue-500',
        solid: 'bg-blue-600 text-white',
        border: 'border-blue-400',
      };
    case 'LOW':
      return {
        badge: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
        dot: 'bg-slate-400',
        solid: 'bg-slate-600 text-white',
        border: 'border-slate-300',
      };
  }
}

export function getStatusStyles(status: IssueStatus) {
  switch (status) {
    case 'SUBMITTED':
      return {
        label: 'Submitted',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        bg: 'bg-purple-500',
        text: 'text-purple-700',
      };
    case 'UNDER_REVIEW':
      return {
        label: 'Under Review',
        badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        bg: 'bg-cyan-500',
        text: 'text-cyan-700',
      };
    case 'ASSIGNED':
      return {
        label: 'Assigned',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bg: 'bg-indigo-500',
        text: 'text-indigo-700',
      };
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        bg: 'bg-amber-500',
        text: 'text-amber-700',
      };
    case 'RESOLVED':
      return {
        label: 'Resolved',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bg: 'bg-emerald-600',
        text: 'text-emerald-700',
      };
    case 'CLOSED':
      return {
        label: 'Closed',
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        bg: 'bg-slate-700',
        text: 'text-slate-700',
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        bg: 'bg-rose-500',
        text: 'text-rose-700',
      };
  }
}

export function getDefaultPermissionsForRole(role: UserRole): UserPermission[] {
  switch (role) {
    case 'ADMIN':
      return [
        'MANAGE_USERS',
        'MANAGE_DEPARTMENTS',
        'VERIFY_ISSUES',
        'ASSIGN_TASKS',
        'PERFORM_MAINTENANCE',
        'REPORT_ISSUES',
        'VIEW_ALL_ISSUES',
        'VIEW_ANALYTICS',
        'MANAGE_CONFIG',
        'RATE_RESOLUTION',
        'CLOSE_ISSUES',
        'MERGE_DUPLICATES',
      ];
    case 'DEPARTMENT_MANAGER':
      return [
        'VERIFY_ISSUES',
        'ASSIGN_TASKS',
        'REPORT_ISSUES',
        'VIEW_ALL_ISSUES',
        'VIEW_ANALYTICS',
        'CLOSE_ISSUES',
        'MERGE_DUPLICATES',
      ];
    case 'MAINTENANCE_STAFF':
      return [
        'PERFORM_MAINTENANCE',
        'REPORT_ISSUES',
      ];
    case 'CITIZEN':
      return [
        'REPORT_ISSUES',
        'RATE_RESOLUTION',
      ];
  }
}

export function checkPasswordStrength(password: string): {
  score: number; // 0 to 4
  feedback: string;
  isValid: boolean;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let feedback = 'Weak password';
  let label = 'Weak';
  if (score === 1) {
    feedback = 'Fair (add uppercase & numbers)';
    label = 'Weak';
  } else if (score === 2) {
    feedback = 'Moderate (add special characters)';
    label = 'Medium';
  } else if (score === 3) {
    feedback = 'Strong';
    label = 'Strong';
  } else if (score >= 4) {
    feedback = 'Very Secure';
    label = 'Strong';
  }

  return {
    score,
    feedback,
    isValid: password.length >= 6,
    label,
  };
}
