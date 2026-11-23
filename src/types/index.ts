export type UserRole = 'ADMIN' | 'DEPARTMENT_MANAGER' | 'MAINTENANCE_STAFF' | 'CITIZEN';

export type UserPermission =
  | 'MANAGE_USERS'
  | 'MANAGE_DEPARTMENTS'
  | 'VERIFY_ISSUES'
  | 'ASSIGN_TASKS'
  | 'PERFORM_MAINTENANCE'
  | 'REPORT_ISSUES'
  | 'VIEW_ALL_ISSUES'
  | 'VIEW_ANALYTICS'
  | 'MANAGE_CONFIG'
  | 'RATE_RESOLUTION'
  | 'CLOSE_ISSUES'
  | 'MERGE_DUPLICATES';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatar?: string;
  phone: string;
  assignedZone?: string;
  skills?: string[];
  activeTasks?: number;
  completedTasksCount?: number;
  passwordHash?: string; // Simulated SHA-256 / bcrypt hash
  permissions: UserPermission[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export type DepartmentCode = 
  | 'ROADS' 
  | 'LIGHTING' 
  | 'WATER' 
  | 'FOOTPATHS' 
  | 'WASTE' 
  | 'PUBLIC_INFRA';

export interface Department {
  id: string;
  name: string;
  code: DepartmentCode;
  icon: string;
  color: string;
  headManagerId: string;
  headManagerName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  activeStaffCount: number;
  activeIssuesCount: number;
  resolvedIssuesCount: number;
  avgResolutionHours: number;
  budgetAllocated: number;
  budgetSpent: number;
  status: 'ACTIVE' | 'INACTIVE';
  slaHours: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
}

export type IssueCategory = 
  | 'ROAD_DAMAGE' 
  | 'STREETLIGHT' 
  | 'DRAINAGE' 
  | 'FOOTPATH' 
  | 'WASTE_MANAGEMENT' 
  | 'PUBLIC_INFRASTRUCTURE'
  | 'WASTE'
  | 'PUBLIC_INFRA';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IssueStatus = 
  | 'SUBMITTED' 
  | 'UNDER_REVIEW' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED' 
  | 'REJECTED';

export interface LocationData {
  address: string;
  landmark?: string;
  lat: number;
  lng: number;
  cityZone: string;
}

export interface IssueTimelineEvent {
  id: string;
  status: IssueStatus;
  title: string;
  description: string;
  actorName: string;
  actorRole: UserRole;
  actorId: string;
  timestamp: string;
}

export interface IssueNote {
  id: string;
  authorName: string;
  authorRole: UserRole;
  authorId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface CitizenFeedback {
  rating: number; // 1 to 5
  satisfaction?: 'EXCELLENT' | 'GOOD' | 'NEUTRAL' | 'POOR';
  comment: string;
  submittedAt: string;
  civicPraiseTags?: string[];
  citizenName?: string;
  citizenId?: string;
  satisfactionScore?: number;
}

export interface WorkReport {
  partsUsed?: string[];
  laborHours?: number;
  costEstimate?: number;
  rootCause?: string;
  summary?: string;
  submittedAt: string;
  completedAt?: string;
  staffId?: string;
  staffName?: string;
  completionPhotoUrls?: string[];
  notes?: string;
  hoursSpent?: number;
  materialsUsed?: string[];
  equipmentUsed?: string[];
}

export interface Issue {
  id: string; // e.g., CP-8012
  ticketNumber?: string;
  title: string;
  description: string;
  category: IssueCategory;
  departmentId: string;
  departmentName: string;
  priority: IssuePriority;
  status: IssueStatus;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  citizenPhone: string;
  location: LocationData;
  photoUrls: string[];
  completionPhotos: string[];
  createdAt: string;
  updatedAt: string;
  underReviewAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  assignedAt?: string;
  estimatedCompletionDate?: string;
  completedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  slaDeadline: string;
  isSlaBreached: boolean;
  notes: IssueNote[];
  timeline: IssueTimelineEvent[];
  citizenFeedback?: CitizenFeedback;
  feedback?: CitizenFeedback;
  workReport?: WorkReport;
  rejectionReason?: string;
  duplicateOfId?: string;
  isDuplicate?: boolean;
  upvotes: number;
  upvotedBy?: string[];
  isEmergency?: boolean;
}

export interface SystemConfig {
  appName: string;
  emergencyAlert: {
    active: boolean;
    message: string;
    level: 'INFO' | 'WARNING' | 'EMERGENCY';
  };
  autoAssignment: boolean;
  duplicateDetectionRadiusMeters: number;
  slaWarningThresholdHours: number;
  allowPublicViewing: boolean;
  cityZones: string[];
  defaultLanguage: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL';
  issueId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
}
