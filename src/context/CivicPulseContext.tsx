'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Department,
  Issue,
  SystemConfig,
  AppNotification,
  UserRole,
  UserPermission,
  IssuePriority,
  IssueStatus,
  IssueCategory,
  WorkReport,
  CitizenFeedback,
  AuthSession,
} from '../types';
import {
  SEED_USERS,
  SEED_DEPARTMENTS,
  SEED_ISSUES,
  INITIAL_SYSTEM_CONFIG,
  SEED_NOTIFICATIONS,
} from '../data/seedData';
import { calculateDistanceMeters, getDefaultPermissionsForRole, getSlaRemaining } from '../lib/utils';
import { useToast } from '../components/ToastNotification';
import { SAMPLE_LOCATIONS } from '../data/sampleLocations';

interface CivicPulseContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  session: AuthSession | null;
  users: User[];
  departments: Department[];
  issues: Issue[];
  systemConfig: SystemConfig;
  notifications: AppNotification[];
  
  // Auth & Permissions
  login: (email: string, password?: string) => { success: boolean; error?: string };
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: UserRole;
    assignedZone?: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (permission: UserPermission) => boolean;
  switchRole: (role: UserRole, specificUserId?: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (newPassword: string) => boolean;

  // Issue Operations
  reportIssue: (data: {
    title: string;
    description: string;
    category: IssueCategory;
    departmentId: string;
    priority?: IssuePriority;
    location: {
      address: string;
      landmark?: string;
      lat: number;
      lng: number;
      cityZone: string;
    };
    photoUrls: string[];
  }) => Issue;
  reviewIssue: (issueId: string, priority: IssuePriority, departmentId?: string) => void;
  rejectIssue: (issueId: string, reason: string) => void;
  assignTask: (issueId: string, staffId: string, estimatedDate?: string, note?: string) => void;
  updateTaskStatus: (issueId: string, status: IssueStatus, note?: string) => void;
  submitWorkReport: (
    issueId: string,
    report: Omit<WorkReport, 'submittedAt'>,
    completionPhotos: string[]
  ) => void;
  closeIssue: (issueId: string, managerNote?: string) => void;
  reopenTask: (issueId: string, reworkReason: string) => void;
  transferDepartment: (issueId: string, targetDeptId: string, reason: string) => void;
  mergeDuplicate: (duplicateIssueId: string, targetIssueId: string, note?: string) => void;
  submitCitizenFeedback: (issueId: string, feedback: Omit<CitizenFeedback, 'submittedAt'>) => void;
  upvoteIssue: (issueId: string) => void;
  addIssueNote: (issueId: string, content: string, isInternal: boolean) => void;
  findNearbyIssues: (lat: number, lng: number, radiusMeters?: number) => { issue: Issue; distance: number }[];

  // Department Operations
  addDepartment: (dept: Omit<Department, 'id' | 'activeStaffCount' | 'activeIssuesCount' | 'resolvedIssuesCount' | 'avgResolutionHours' | 'budgetSpent'>) => void;
  updateDepartment: (deptId: string, updates: Partial<Department>) => void;
  toggleDepartmentStatus: (deptId: string) => void;

  // User Operations
  addUser: (userData: Omit<User, 'id' | 'createdAt' | 'permissions'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;

  // System Config
  updateSystemConfig: (updates: Partial<SystemConfig>) => void;

  // Notifications & Alerts
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  addToast: (title: string, message: string, type?: 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL') => void;

  // Dark Mode & Theming (Bonus Challenge #8)
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Real-Time Incident Telemetry Stream (Bonus Challenge #1)
  isTelemetryActive: boolean;
  toggleTelemetry: () => void;
  simulateIncomingReport: () => void;

  // Automated Maintenance Reminders (Bonus Challenge #6)
  sendMaintenanceReminder: (issueId: string) => void;

  // Reset database helper
  resetToDefaults: () => void;
}

const CivicPulseContext = createContext<CivicPulseContextType | undefined>(undefined);

const STORAGE_KEY_ISSUES = 'civicpulse_issues_v4';
const STORAGE_KEY_USERS = 'civicpulse_users_v4';
const STORAGE_KEY_DEPTS = 'civicpulse_depts_v4';
const STORAGE_KEY_CONFIG = 'civicpulse_config_v4';
const STORAGE_KEY_NOTIFS = 'civicpulse_notifs_v4';
const STORAGE_KEY_SESSION = 'civicpulse_session_v4';

export const CivicPulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isTelemetryActive, setIsTelemetryActive] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]);
  const [session, setSession] = useState<AuthSession | null>({
    token: 'cp_session_token_admin',
    user: SEED_USERS[0],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  const [departments, setDepartments] = useState<Department[]>(SEED_DEPARTMENTS);
  const [issues, setIssues] = useState<Issue[]>(SEED_ISSUES);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(INITIAL_SYSTEM_CONFIG);
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      if (storedUsers) setUsers(JSON.parse(storedUsers));

      const storedDepts = localStorage.getItem(STORAGE_KEY_DEPTS);
      if (storedDepts) setDepartments(JSON.parse(storedDepts));

      const storedIssues = localStorage.getItem(STORAGE_KEY_ISSUES);
      if (storedIssues) setIssues(JSON.parse(storedIssues));

      const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (storedConfig) setSystemConfig(JSON.parse(storedConfig));

      const storedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (storedNotifs) setNotifications(JSON.parse(storedNotifs));

      const storedSession = localStorage.getItem(STORAGE_KEY_SESSION);
      if (storedSession) {
        const parsedSession: AuthSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setCurrentUser(parsedSession.user);
      }

      const storedTheme = localStorage.getItem('civicpulse_theme_v4');
      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Failed to parse from localStorage, using initial seed data', e);
    }
    setIsInitialized(true);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        try { localStorage.setItem('civicpulse_theme_v4', 'dark'); } catch {}
      } else {
        document.documentElement.classList.remove('dark');
        try { localStorage.setItem('civicpulse_theme_v4', 'light'); } catch {}
      }
      return next;
    });
  };

  // Save changes to LocalStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEY_DEPTS, JSON.stringify(departments));
      localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(issues));
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(systemConfig));
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
      if (session) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }, [users, departments, issues, systemConfig, notifications, session, isInitialized]);

  // Auth Functions
  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'User account with this email not found.' };
    }
    if (user.status === 'INACTIVE') {
      return { success: false, error: 'This user account has been deactivated by the system administrator.' };
    }

    const newSession: AuthSession = {
      token: `cp_session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      user,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    setSession(newSession);
    setCurrentUser(user);
    notify('Sign-in Successful', `Logged in as ${user.name} (${user.role})`, 'SUCCESS', undefined, user.id);
    return { success: true };
  };

  const register = (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role?: UserRole;
    assignedZone?: string;
  }): { success: boolean; error?: string } => {
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email is already registered.' };
    }

    const targetRole = data.role || 'CITIZEN';
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: targetRole,
      assignedZone: data.assignedZone || 'Sector 4 - Downtown',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`,
      permissions: getDefaultPermissionsForRole(targetRole),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      passwordHash: `sha256:${data.password || 'password123'}`,
      activeTasks: 0,
      completedTasksCount: 0,
    };

    setUsers((prev) => [...prev, newUser]);
    
    // Auto login
    const newSession: AuthSession = {
      token: `cp_session_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      user: newUser,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    setSession(newSession);
    setCurrentUser(newUser);

    notify('Welcome to CivicPulse!', `Account created for ${newUser.name}.`, 'SUCCESS', undefined, newUser.id);
    return { success: true };
  };

  const logout = () => {
    setSession(null);
    // Default to first user or clear
    if (users.length > 0) {
      setCurrentUser(users[0]);
    }
  };

  const hasPermission = (permission: UserPermission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    return currentUser.permissions?.includes(permission) || false;
  };

  const switchRole = (role: UserRole, specificUserId?: string) => {
    if (specificUserId) {
      const target = users.find((u) => u.id === specificUserId);
      if (target) {
        setCurrentUser(target);
        setSession({
          token: `cp_session_${Date.now()}`,
          user: target,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
        return;
      }
    }
    const match = users.find((u) => u.role === role);
    if (match) {
      setCurrentUser(match);
      setSession({
        token: `cp_session_${Date.now()}`,
        user: match,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updates } : u))
    );
    setCurrentUser((prev) => ({ ...prev, ...updates }));
    if (session) {
      setSession({ ...session, user: { ...session.user, ...updates } });
    }
  };

  const changePassword = (newPassword: string): boolean => {
    const newHash = `sha256:${newPassword}`;
    updateProfile({ passwordHash: newHash });
    notify('Security Alert', 'Your password was updated successfully.', 'SUCCESS', undefined, currentUser.id);
    return true;
  };

  const notify = (
    title: string,
    message: string,
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'CRITICAL',
    targetRole?: UserRole,
    userId?: string,
    issueId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      targetRole,
      userId,
      issueId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    if (addToast) {
      addToast(title, message, type);
    }
  };

  // Duplicate detection finder
  const findNearbyIssues = (lat: number, lng: number, radiusMeters: number = systemConfig.duplicateDetectionRadiusMeters) => {
    const openIssues = issues.filter(
      (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.status !== 'REJECTED'
    );

    const matches: { issue: Issue; distance: number }[] = [];
    openIssues.forEach((issue) => {
      const distance = calculateDistanceMeters(lat, lng, issue.location.lat, issue.location.lng);
      if (distance <= radiusMeters) {
        matches.push({ issue, distance });
      }
    });

    return matches.sort((a, b) => a.distance - b.distance);
  };

  // Issue Operations
  const reportIssue = (data: {
    title: string;
    description: string;
    category: IssueCategory;
    departmentId: string;
    priority?: IssuePriority;
    location: {
      address: string;
      landmark?: string;
      lat: number;
      lng: number;
      cityZone: string;
    };
    photoUrls: string[];
  }): Issue => {
    const dept = departments.find((d) => d.id === data.departmentId) || departments[0];
    const initialPriority: IssuePriority = data.priority || 'MEDIUM';
    const now = new Date();
    const deadlineHours = dept.slaHours[initialPriority] || 24;
    const slaDeadline = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000).toISOString();

    const idNumber = Math.floor(1000 + Math.random() * 9000);
    const newIssueId = `CP-${idNumber}`;

    const newIssue: Issue = {
      id: newIssueId,
      title: data.title,
      description: data.description,
      category: data.category,
      departmentId: dept.id,
      departmentName: dept.name,
      priority: initialPriority,
      status: 'SUBMITTED',
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      citizenEmail: currentUser.email,
      citizenPhone: currentUser.phone,
      location: data.location,
      photoUrls: data.photoUrls.length > 0 ? data.photoUrls : ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'],
      completionPhotos: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      slaDeadline,
      isSlaBreached: false,
      notes: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          status: 'SUBMITTED',
          title: 'Infrastructure Problem Submitted',
          description: `Filed by ${currentUser.name} (${currentUser.email}) with GPS coordinates ${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}.`,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          actorId: currentUser.id,
          timestamp: now.toISOString(),
        },
      ],
      upvotes: 1,
    };

    setIssues((prev) => [newIssue, ...prev]);

    setDepartments((prev) =>
      prev.map((d) =>
        d.id === dept.id ? { ...d, activeIssuesCount: d.activeIssuesCount + 1 } : d
      )
    );

    notify(
      `New Report: ${newIssue.title}`,
      `Filed in ${dept.name} at ${data.location.address}. Priority: ${initialPriority}`,
      initialPriority === 'CRITICAL' ? 'CRITICAL' : 'INFO',
      'DEPARTMENT_MANAGER',
      undefined,
      newIssueId
    );

    notify(
      `Citizen Report Submitted: ${newIssueId}`,
      `A new municipal report was submitted in ${data.location.cityZone}`,
      'INFO',
      'ADMIN',
      undefined,
      newIssueId
    );

    return newIssue;
  };

  const reviewIssue = (issueId: string, priority: IssuePriority, departmentId?: string) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const targetDeptId = departmentId || iss.departmentId;
        const dept = departments.find((d) => d.id === targetDeptId) || departments[0];
        const slaHours = dept.slaHours[priority] || 24;
        const newDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();

        return {
          ...iss,
          departmentId: dept.id,
          departmentName: dept.name,
          priority,
          status: 'UNDER_REVIEW',
          underReviewAt: now.toISOString(),
          updatedAt: now.toISOString(),
          slaDeadline: newDeadline,
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'UNDER_REVIEW',
              title: 'Under Review by Department Manager',
              description: `Verified and placed under review by ${currentUser.name}. Priority set to ${priority}. Target SLA: ${slaHours}h.`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );

    notify(
      `Report Under Review: ${issueId}`,
      `Your report has been verified by the department and placed under review for maintenance dispatch.`,
      'INFO',
      'CITIZEN',
      undefined,
      issueId
    );
  };

  const rejectIssue = (issueId: string, reason: string) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          status: 'REJECTED',
          rejectionReason: reason,
          updatedAt: now.toISOString(),
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'REJECTED',
              title: 'Issue Rejected / Non-Actionable',
              description: `Rejected by ${currentUser.name}. Reason: ${reason}`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );

    notify(
      `Issue Report Update: ${issueId}`,
      `Your report was closed: ${reason}`,
      'WARNING',
      'CITIZEN',
      undefined,
      issueId
    );
  };

  const assignTask = (
    issueId: string,
    staffId: string,
    estimatedDate?: string,
    note?: string
  ) => {
    const staff = users.find((u) => u.id === staffId);
    if (!staff) return;
    const now = new Date();

    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const updatedNotes = note
          ? [
              ...iss.notes,
              {
                id: `note-${Date.now()}`,
                authorName: currentUser.name,
                authorRole: currentUser.role,
                authorId: currentUser.id,
                content: `Dispatch instruction: ${note}`,
                isInternal: true,
                createdAt: now.toISOString(),
              },
            ]
          : iss.notes;

        return {
          ...iss,
          status: 'ASSIGNED',
          assignedStaffId: staff.id,
          assignedStaffName: staff.name,
          assignedAt: now.toISOString(),
          estimatedCompletionDate: estimatedDate || iss.estimatedCompletionDate,
          updatedAt: now.toISOString(),
          notes: updatedNotes,
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'ASSIGNED',
              title: 'Assigned to Field Specialist',
              description: `Dispatched to ${staff.name} by ${currentUser.name}.${note ? ` Instruction: "${note}"` : ''}`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );

    // Increment staff workload
    setUsers((prev) =>
      prev.map((u) =>
        u.id === staffId ? { ...u, activeTasks: (u.activeTasks || 0) + 1 } : u
      )
    );

    notify(
      `New Task Assigned: ${issueId}`,
      `You have been assigned to handle issue ${issueId} by ${currentUser.name}.`,
      'INFO',
      'MAINTENANCE_STAFF',
      staffId,
      issueId
    );

    notify(
      `Maintenance Crew Assigned: ${issueId}`,
      `Field technician ${staff.name} has been assigned to your issue.`,
      'INFO',
      'CITIZEN',
      undefined,
      issueId
    );
  };

  const updateTaskStatus = (issueId: string, status: IssueStatus, note?: string) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const newNotes = note
          ? [
              ...iss.notes,
              {
                id: `note-${Date.now()}`,
                authorName: currentUser.name,
                authorRole: currentUser.role,
                authorId: currentUser.id,
                content: note,
                isInternal: false,
                createdAt: now.toISOString(),
              },
            ]
          : iss.notes;

        return {
          ...iss,
          status,
          updatedAt: now.toISOString(),
          notes: newNotes,
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status,
              title: `Status Changed to ${status.replace('_', ' ')}`,
              description: note || `Field maintenance status updated by ${currentUser.name}.`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );
  };

  const submitWorkReport = (
    issueId: string,
    report: Omit<WorkReport, 'submittedAt'>,
    completionPhotos: string[]
  ) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          status: 'RESOLVED',
          resolvedAt: now.toISOString(),
          completedAt: now.toISOString(),
          updatedAt: now.toISOString(),
          completionPhotos: completionPhotos.length > 0 ? completionPhotos : [
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
          ],
          workReport: {
            ...report,
            submittedAt: now.toISOString(),
          },
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'RESOLVED',
              title: 'Work Completed & Resolved by Crew',
              description: `${currentUser.name} completed repairs, submitted completion photos and technical report.`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );

    // Update department stats
    const currentIss = issues.find((i) => i.id === issueId);
    if (currentIss) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === currentIss.departmentId
            ? {
                ...d,
                activeIssuesCount: Math.max(0, d.activeIssuesCount - 1),
                resolvedIssuesCount: d.resolvedIssuesCount + 1,
              }
            : d
        )
      );

      if (currentIss.assignedStaffId) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === currentIss.assignedStaffId
              ? {
                  ...u,
                  activeTasks: Math.max(0, (u.activeTasks || 1) - 1),
                  completedTasksCount: (u.completedTasksCount || 0) + 1,
                }
              : u
          )
        );
      }
    }

    notify(
      `Issue Resolved! ${issueId}`,
      `Your reported infrastructure issue has been resolved. Please rate our service!`,
      'SUCCESS',
      'CITIZEN',
      currentIss?.citizenId,
      issueId
    );
  };

  const closeIssue = (issueId: string, managerNote?: string) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const newNotes = managerNote
          ? [
              ...iss.notes,
              {
                id: `note-${Date.now()}`,
                authorName: currentUser.name,
                authorRole: currentUser.role,
                authorId: currentUser.id,
                content: `Case Closed: ${managerNote}`,
                isInternal: false,
                createdAt: now.toISOString(),
              },
            ]
          : iss.notes;

        return {
          ...iss,
          status: 'CLOSED',
          closedAt: now.toISOString(),
          updatedAt: now.toISOString(),
          notes: newNotes,
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'CLOSED',
              title: 'Issue Officially Closed & Archived',
              description: `Case reviewed and officially closed by ${currentUser.name}.${managerNote ? ` Note: "${managerNote}"` : ''}`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );
  };

  const reopenTask = (issueId: string, reworkReason: string) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          status: 'IN_PROGRESS',
          updatedAt: now.toISOString(),
          notes: [
            ...iss.notes,
            {
              id: `note-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: currentUser.role,
              authorId: currentUser.id,
              content: `RE-OPENED BY MANAGER: ${reworkReason}`,
              isInternal: false,
              createdAt: now.toISOString(),
            },
          ],
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: 'IN_PROGRESS',
              title: 'Task Re-Opened for Rework',
              description: `Manager ${currentUser.name} requested further repair work: ${reworkReason}`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );

    notify(
      `Rework Required: ${issueId}`,
      `Manager reopened task: "${reworkReason}".`,
      'WARNING',
      'MAINTENANCE_STAFF',
      undefined,
      issueId
    );
  };

  const transferDepartment = (issueId: string, targetDeptId: string, reason: string) => {
    const targetDept = departments.find((d) => d.id === targetDeptId);
    if (!targetDept) return;
    const now = new Date();

    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        const oldDeptName = iss.departmentName;
        return {
          ...iss,
          departmentId: targetDept.id,
          departmentName: targetDept.name,
          updatedAt: now.toISOString(),
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: iss.status,
              title: `Department Transferred to ${targetDept.name}`,
              description: `Transferred from ${oldDeptName} to ${targetDept.name} by ${currentUser.name}. Reason: ${reason}`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );

    notify(
      `Department Reassigned: ${issueId}`,
      `Issue transferred to ${targetDept.name}.`,
      'INFO',
      'DEPARTMENT_MANAGER',
      undefined,
      issueId
    );
  };

  const mergeDuplicate = (duplicateIssueId: string, targetIssueId: string, note?: string) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id === duplicateIssueId) {
          return {
            ...iss,
            status: 'CLOSED',
            isDuplicate: true,
            duplicateOfId: targetIssueId,
            closedAt: now.toISOString(),
            updatedAt: now.toISOString(),
            timeline: [
              ...iss.timeline,
              {
                id: `tl-${Date.now()}`,
                status: 'CLOSED',
                title: `Marked as Duplicate of #${targetIssueId}`,
                description: `Merged into primary incident ticket #${targetIssueId} by ${currentUser.name}.${note ? ` Reason: ${note}` : ''}`,
                actorName: currentUser.name,
                actorRole: currentUser.role,
                actorId: currentUser.id,
                timestamp: now.toISOString(),
              },
            ],
          };
        }
        if (iss.id === targetIssueId) {
          return {
            ...iss,
            upvotes: iss.upvotes + 1,
            notes: [
              ...iss.notes,
              {
                id: `note-${Date.now()}`,
                authorName: currentUser.name,
                authorRole: currentUser.role,
                authorId: currentUser.id,
                content: `Merged duplicate report #${duplicateIssueId} into this ticket.`,
                isInternal: true,
                createdAt: now.toISOString(),
              },
            ],
          };
        }
        return iss;
      })
    );

    notify(
      `Duplicate Merged: ${duplicateIssueId}`,
      `Merged into #${targetIssueId}.`,
      'INFO',
      'DEPARTMENT_MANAGER',
      undefined,
      targetIssueId
    );
  };

  const submitCitizenFeedback = (
    issueId: string,
    feedback: Omit<CitizenFeedback, 'submittedAt'>
  ) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          citizenFeedback: {
            ...feedback,
            submittedAt: now.toISOString(),
          },
          timeline: [
            ...iss.timeline,
            {
              id: `tl-${Date.now()}`,
              status: iss.status,
              title: 'Citizen Service Feedback Received',
              description: `Citizen rated this resolution ${feedback.rating}/5 stars (${feedback.satisfaction}): "${feedback.comment}"`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              actorId: currentUser.id,
              timestamp: now.toISOString(),
            },
          ],
        };
      })
    );
  };

  const upvoteIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((iss) => (iss.id === issueId ? { ...iss, upvotes: iss.upvotes + 1 } : iss))
    );
  };

  const addIssueNote = (issueId: string, content: string, isInternal: boolean) => {
    const now = new Date();
    setIssues((prev) =>
      prev.map((iss) => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          notes: [
            ...iss.notes,
            {
              id: `note-${Date.now()}`,
              authorName: currentUser.name,
              authorRole: currentUser.role,
              authorId: currentUser.id,
              content,
              isInternal,
              createdAt: now.toISOString(),
            },
          ],
        };
      })
    );
  };

  // Department Management
  const addDepartment = (
    deptData: Omit<
      Department,
      | 'id'
      | 'activeStaffCount'
      | 'activeIssuesCount'
      | 'resolvedIssuesCount'
      | 'avgResolutionHours'
      | 'budgetSpent'
    >
  ) => {
    const newDept: Department = {
      ...deptData,
      id: `dept-${Date.now().toString(36)}`,
      activeStaffCount: 0,
      activeIssuesCount: 0,
      resolvedIssuesCount: 0,
      avgResolutionHours: 24,
      budgetSpent: 0,
    };
    setDepartments((prev) => [...prev, newDept]);
  };

  const updateDepartment = (deptId: string, updates: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, ...updates } : d))
    );
  };

  const toggleDepartmentStatus = (deptId: string) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? { ...d, status: d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : d
      )
    );
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'createdAt' | 'permissions'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now().toString(36)}`,
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      permissions: getDefaultPermissionsForRole(userData.role),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const updateSystemConfig = (updates: Partial<SystemConfig>) => {
    setSystemConfig((prev) => ({ ...prev, ...updates }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const toggleTelemetry = () => {
    setIsTelemetryActive((prev) => {
      const next = !prev;
      if (next) {
        notify('Live Telemetry Stream Active', 'Simulated smart city sensor telemetry and incident influx enabled (35s interval).', 'SUCCESS');
      } else {
        notify('Live Telemetry Paused', 'Simulated smart city incident stream suspended.', 'INFO');
      }
      return next;
    });
  };

  const simulateIncomingReport = () => {
    const randomLoc = SAMPLE_LOCATIONS[Math.floor(Math.random() * SAMPLE_LOCATIONS.length)];
    const categories: IssueCategory[] = ['ROAD_DAMAGE', 'STREETLIGHT', 'DRAINAGE', 'FOOTPATH', 'WASTE', 'PUBLIC_INFRA'];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const deptMap: Record<IssueCategory, { id: string; name: string }> = {
      ROAD_DAMAGE: { id: 'dept-roads', name: 'Road Damage & Pavements' },
      STREETLIGHT: { id: 'dept-lighting', name: 'Streetlight & Electrical Grid' },
      DRAINAGE: { id: 'dept-water', name: 'Drainage & Stormwater' },
      FOOTPATH: { id: 'dept-footpaths', name: 'Footpath & Sidewalk Safety' },
      WASTE: { id: 'dept-waste', name: 'Waste Management & Cleanliness' },
      WASTE_MANAGEMENT: { id: 'dept-waste', name: 'Waste Management & Cleanliness' },
      PUBLIC_INFRA: { id: 'dept-public-infra', name: 'Public Infrastructure & Structures' },
      PUBLIC_INFRASTRUCTURE: { id: 'dept-public-infra', name: 'Public Infrastructure & Structures' },
    };
    const titles: Record<IssueCategory, string[]> = {
      ROAD_DAMAGE: ['Cavitation on Fast Commuter Lane', 'Asphalt Subsidence Along Curb', 'Longitudinal Frost Fissure'],
      STREETLIGHT: ['Power Surge Tripped Luminaire Cluster', 'Fallen Lamp Post Damaged Base', 'Dark Pedestrian Crossing Signal'],
      DRAINAGE: ['Heavy Mud Clogging Storm Drain Curb Grate', 'Manhole Lid Rocking Under Traffic', 'Culvert Runoff Blocked by Debris'],
      FOOTPATH: ['Tripping Ledge Caused by Tree Roots', 'Broken Flagstone on Sidewalk', 'Shattered ADA Curb Ramp Transition'],
      WASTE: ['Commercial Refuse Dumped on Green Verge', 'Overflowing Public Litter Sacks', 'Hazardous Solvents Left in Alley'],
      WASTE_MANAGEMENT: ['Commercial Refuse Dumped on Green Verge', 'Overflowing Public Litter Sacks', 'Hazardous Solvents Left in Alley'],
      PUBLIC_INFRA: ['Cracked Pedestrian Overpass Railing', 'Graffiti & Vandalism on Transit Shelter', 'Loose Decorative Granite Bench'],
      PUBLIC_INFRASTRUCTURE: ['Cracked Pedestrian Overpass Railing', 'Graffiti & Vandalism on Transit Shelter', 'Loose Decorative Granite Bench'],
    };
    const title = titles[cat][Math.floor(Math.random() * titles[cat].length)];
    const newIssue = reportIssue({
      title: `[LIVE ALERT] ${title}`,
      description: `Automated smart city incident telemetry detected anomaly near ${randomLoc.landmark}. Immediate dispatch assessment recommended.`,
      category: cat,
      departmentId: deptMap[cat].id,
      priority: Math.random() > 0.4 ? 'HIGH' : 'CRITICAL',
      location: {
        address: randomLoc.address,
        landmark: randomLoc.landmark,
        lat: randomLoc.lat + (Math.random() - 0.5) * 0.002,
        lng: randomLoc.lng + (Math.random() - 0.5) * 0.002,
        cityZone: randomLoc.cityZone,
      },
      photoUrls: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
    });

    notify(
      `🚨 Live City Alert: ${newIssue.ticketNumber || newIssue.id}`,
      `New incident reported at ${randomLoc.address}. Triage required.`,
      'CRITICAL',
      'DEPARTMENT_MANAGER',
      undefined,
      newIssue.id
    );
  };

  // Live telemetry timer effect
  useEffect(() => {
    if (!isTelemetryActive) return;
    const interval = setInterval(() => {
      simulateIncomingReport();
    }, 35000);
    return () => clearInterval(interval);
  }, [isTelemetryActive]);

  const sendMaintenanceReminder = (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (!issue) return;

    const assignedStaff = users.find((u) => u.id === issue.assignedStaffId);
    const recipient = assignedStaff ? assignedStaff.name : 'Assigned Technician';
    const slaInfo = getSlaRemaining(issue.slaDeadline, issue.status);

    const reminderContent = `AUTOMATED MAINTENANCE REMINDER: SLA Status is [${slaInfo.text}]. Please submit progress update or completion report immediately.`;

    addIssueNote(issueId, reminderContent, true);

    notify(
      `SLA Reminder Pushed: ${issue.ticketNumber || issue.id}`,
      `Automated notification sent to technician ${recipient}.`,
      'WARNING',
      'MAINTENANCE_STAFF',
      issue.assignedStaffId,
      issue.id
    );
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY_USERS);
    localStorage.removeItem(STORAGE_KEY_DEPTS);
    localStorage.removeItem(STORAGE_KEY_ISSUES);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    setUsers(SEED_USERS);
    setCurrentUser(SEED_USERS[0]);
    setSession({
      token: 'cp_session_token_admin',
      user: SEED_USERS[0],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
    setDepartments(SEED_DEPARTMENTS);
    setIssues(SEED_ISSUES);
    setSystemConfig(INITIAL_SYSTEM_CONFIG);
    setNotifications(SEED_NOTIFICATIONS);
  };

  return (
    <CivicPulseContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        session,
        users,
        departments,
        issues,
        systemConfig,
        notifications,
        login,
        register,
        logout,
        hasPermission,
        switchRole,
        updateProfile,
        changePassword,
        reportIssue,
        reviewIssue,
        rejectIssue,
        assignTask,
        updateTaskStatus,
        submitWorkReport,
        closeIssue,
        reopenTask,
        transferDepartment,
        mergeDuplicate,
        submitCitizenFeedback,
        upvoteIssue,
        addIssueNote,
        findNearbyIssues,
        addDepartment,
        updateDepartment,
        toggleDepartmentStatus,
        addUser,
        updateUser,
        deleteUser,
        updateSystemConfig,
        markNotificationAsRead,
        clearNotifications,
        addToast,
        darkMode,
        toggleDarkMode,
        isTelemetryActive,
        toggleTelemetry,
        simulateIncomingReport,
        sendMaintenanceReminder,
        resetToDefaults,
      }}
    >
      {children}
    </CivicPulseContext.Provider>
  );
};

export const useCivicPulse = () => {
  const context = useContext(CivicPulseContext);
  if (!context) {
    throw new Error('useCivicPulse must be used within a CivicPulseProvider');
  }
  return context;
};
