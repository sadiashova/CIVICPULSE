import { NextResponse } from 'next/server';
import { SEED_ISSUES, SEED_USERS } from '../../../../data/seedData';
import { Issue, IssueStatus, User } from '../../../../types';
import { canUserTransitionStatus, canCitizenManageReport, canStaffUpdateTask } from '../../../../lib/security';

// In-memory server-side issues repository
let serverIssues: Issue[] = [...SEED_ISSUES];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const issue = serverIssues.find((i) => i.id.toLowerCase() === params.id.toLowerCase());
  if (!issue) {
    return NextResponse.json({ error: 'Issue record not found' }, { status: 404 });
  }
  return NextResponse.json(issue);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const issueIndex = serverIssues.findIndex((i) => i.id.toLowerCase() === params.id.toLowerCase());
    if (issueIndex === -1) {
      return NextResponse.json({ error: 'Issue record not found' }, { status: 404 });
    }

    const issue = serverIssues[issueIndex];
    const body = await request.json();
    const { user, status, priority, assignedStaffId, note, workReport, completionPhotos, citizenFeedback } = body;

    if (!user) {
      return NextResponse.json({ error: 'Authentication required. Missing user identity payload.' }, { status: 401 });
    }

    const activeUser: User = user;

    // Rule 1: Citizens can only manage / submit feedback on their own reports
    if (citizenFeedback) {
      if (!canCitizenManageReport(activeUser, issue)) {
        return NextResponse.json(
          { error: 'Security Violation: Citizens may only submit feedback for their own reports.' },
          { status: 403 }
        );
      }
    }

    // Rule 2 & 7: Check Status Modification Authorization
    if (status && status !== issue.status) {
      const authCheck = canUserTransitionStatus(activeUser, issue, status as IssueStatus);
      if (!authCheck.allowed) {
        return NextResponse.json(
          { error: `Security Authorization Denied: ${authCheck.reason}` },
          { status: 403 }
        );
      }
    }

    // Rule 2: Staff can only update assigned tasks
    if (workReport || (status === 'IN_PROGRESS' || status === 'RESOLVED')) {
      if (activeUser.role === 'MAINTENANCE_STAFF' && !canStaffUpdateTask(activeUser, issue)) {
        return NextResponse.json(
          { error: 'Security Violation: Maintenance staff can only modify tasks assigned to their account.' },
          { status: 403 }
        );
      }
    }

    const now = new Date();
    const updatedTimeline = [...issue.timeline];

    // Preserve History & Append Status Update
    if (status && status !== issue.status) {
      updatedTimeline.push({
        id: `tl-${Date.now()}`,
        status: status as IssueStatus,
        title: `Status Changed to ${status.replace('_', ' ')}`,
        description: note || `Updated by ${activeUser.name} (${activeUser.role}).`,
        actorName: activeUser.name,
        actorRole: activeUser.role,
        actorId: activeUser.id,
        timestamp: now.toISOString(),
      });
    }

    const updatedIssue: Issue = {
      ...issue,
      status: status ? (status as IssueStatus) : issue.status,
      priority: priority ? priority : issue.priority,
      assignedStaffId: assignedStaffId !== undefined ? assignedStaffId : issue.assignedStaffId,
      workReport: workReport ? { ...workReport, submittedAt: now.toISOString() } : issue.workReport,
      completionPhotos: completionPhotos ? completionPhotos : issue.completionPhotos,
      citizenFeedback: citizenFeedback ? { ...citizenFeedback, submittedAt: now.toISOString() } : issue.citizenFeedback,
      timeline: updatedTimeline,
      updatedAt: now.toISOString(),
    };

    serverIssues[issueIndex] = updatedIssue;
    return NextResponse.json(updatedIssue);
  } catch (error) {
    return NextResponse.json({ error: 'Server error processing update.' }, { status: 500 });
  }
}
