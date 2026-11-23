import { User, Issue, IssueStatus, UserRole } from '../types';

/**
 * Section 5: Security & Data Integrity
 * Validates GPS Coordinates
 */
export function validateCoordinates(lat: unknown, lng: unknown): { valid: boolean; error?: string } {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { valid: false, error: 'GPS coordinates must be numeric values.' };
  }
  if (isNaN(lat) || isNaN(lng)) {
    return { valid: false, error: 'GPS coordinates cannot be NaN.' };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, error: `Latitude ${lat} is out of valid range (-90 to +90).` };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, error: `Longitude ${lng} is out of valid range (-180 to +180).` };
  }
  return { valid: true };
}

/**
 * Validates image metadata and base64/URL format
 */
export function validateImageUpload(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type}). Allowed formats: JPEG, PNG, WEBP.`,
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds the 5MB maximum limit (Current: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize text strings to prevent injection
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '') // Strip angle brackets
    .trim();
}

/**
 * Rule 1: Citizens must only manage their own reports
 */
export function canCitizenManageReport(user: User, issue: Issue): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'CITIZEN') {
    return issue.citizenId === user.id || issue.citizenEmail.toLowerCase() === user.email.toLowerCase();
  }
  return false;
}

/**
 * Rule 2: Maintenance staff can only update assigned tasks
 */
export function canStaffUpdateTask(user: User, issue: Issue): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'MAINTENANCE_STAFF') {
    return issue.assignedStaffId === user.id;
  }
  return false;
}

/**
 * Rule 3: Department managers can only manage their own department's issues
 */
export function canManagerManageIssue(user: User, issue: Issue): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') {
    return !user.departmentId || user.departmentId === issue.departmentId;
  }
  return false;
}

/**
 * Rule 4: Only authorized users can verify or close reports
 */
export function canUserVerifyOrClose(user: User, issue: Issue): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') {
    return (!user.departmentId || user.departmentId === issue.departmentId) &&
      (user.permissions.includes('VERIFY_ISSUES') || user.permissions.includes('CLOSE_ISSUES'));
  }
  return false;
}

/**
 * Rule 7: Unauthorized users must not modify issue status
 * Enforces valid transition paths and actor permissions
 */
export function canUserTransitionStatus(
  user: User,
  issue: Issue,
  targetStatus: IssueStatus
): { allowed: boolean; reason?: string } {
  if (user.role === 'ADMIN') {
    return { allowed: true };
  }

  if (user.status === 'INACTIVE') {
    return { allowed: false, reason: 'Deactivated user accounts cannot execute status changes.' };
  }

  switch (targetStatus) {
    case 'UNDER_REVIEW':
      if (user.role !== 'DEPARTMENT_MANAGER') {
        return { allowed: false, reason: 'Only Department Managers or Admins can review and verify issues.' };
      }
      if (user.departmentId && user.departmentId !== issue.departmentId) {
        return { allowed: false, reason: 'Cannot review issues outside of your assigned department.' };
      }
      return { allowed: true };

    case 'ASSIGNED':
      if (user.role !== 'DEPARTMENT_MANAGER') {
        return { allowed: false, reason: 'Only Department Managers can dispatch and assign tasks.' };
      }
      if (user.departmentId && user.departmentId !== issue.departmentId) {
        return { allowed: false, reason: 'Cannot assign tasks for another department.' };
      }
      return { allowed: true };

    case 'IN_PROGRESS':
      if (user.role !== 'MAINTENANCE_STAFF') {
        return { allowed: false, reason: 'Only field maintenance personnel can mark tasks IN PROGRESS.' };
      }
      if (issue.assignedStaffId !== user.id) {
        return { allowed: false, reason: 'Security violation: Maintenance staff can only update assigned tasks.' };
      }
      return { allowed: true };

    case 'RESOLVED':
      if (user.role !== 'MAINTENANCE_STAFF') {
        return { allowed: false, reason: 'Only the assigned field responder can submit completion reports.' };
      }
      if (issue.assignedStaffId !== user.id) {
        return { allowed: false, reason: 'Security violation: Maintenance staff can only update assigned tasks.' };
      }
      return { allowed: true };

    case 'CLOSED':
      if (user.role !== 'DEPARTMENT_MANAGER') {
        return { allowed: false, reason: 'Only Department Managers or Admins can officially close reports.' };
      }
      if (user.departmentId && user.departmentId !== issue.departmentId) {
        return { allowed: false, reason: 'Cannot close tickets outside of your assigned department.' };
      }
      return { allowed: true };

    case 'REJECTED':
      if (user.role !== 'DEPARTMENT_MANAGER') {
        return { allowed: false, reason: 'Only Department Managers or Admins can reject reported issues.' };
      }
      return { allowed: true };

    default:
      return { allowed: false, reason: 'Invalid or unsupported status transition.' };
  }
}
