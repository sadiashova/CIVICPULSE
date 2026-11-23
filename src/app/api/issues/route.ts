import { NextResponse } from 'next/server';
import { SEED_ISSUES, SEED_DEPARTMENTS } from '../../../data/seedData';
import { Issue, IssueCategory, IssuePriority, IssueStatus } from '../../../types';
import { validateCoordinates, sanitizeInput } from '../../../lib/security';

// In-memory server-side issues repository
let serverIssues: Issue[] = [...SEED_ISSUES];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const departmentId = searchParams.get('departmentId');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    let filtered = [...serverIssues];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.location.address.toLowerCase().includes(q) ||
          i.citizenName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category && category !== 'ALL') {
      filtered = filtered.filter((i) => i.category === category);
    }

    // Department filter
    if (departmentId && departmentId !== 'ALL') {
      filtered = filtered.filter((i) => i.departmentId === departmentId);
    }

    // Priority filter
    if (priority && priority !== 'ALL') {
      filtered = filtered.filter((i) => i.priority === priority);
    }

    // Status filter
    if (status && status !== 'ALL') {
      filtered = filtered.filter((i) => i.status === status);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter((i) => new Date(i.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter((i) => new Date(i.createdAt) <= new Date(endDate));
    }

    // Sorting
    filtered.sort((a, b) => {
      let valA: any = a[sortBy as keyof Issue] ?? '';
      let valB: any = b[sortBy as keyof Issue] ?? '';

      if (sortBy === 'priority') {
        const orderMap: Record<IssuePriority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        valA = orderMap[a.priority] || 0;
        valB = orderMap[b.priority] || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedIssues = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      data: paginatedIssues,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error processing issues request.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, departmentId, location, photoUrls, user } = body;

    // Server-Side Validation
    if (!title || title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Validation Error: Title must be at least 5 characters long.' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 15) {
      return NextResponse.json(
        { error: 'Validation Error: Description must be at least 15 characters long.' },
        { status: 400 }
      );
    }

    if (!location || !location.address) {
      return NextResponse.json(
        { error: 'Validation Error: Physical address is required.' },
        { status: 400 }
      );
    }

    // GPS Coordinate Validation
    const coordCheck = validateCoordinates(location.lat, location.lng);
    if (!coordCheck.valid) {
      return NextResponse.json(
        { error: `GPS Validation Error: ${coordCheck.error}` },
        { status: 400 }
      );
    }

    const dept = SEED_DEPARTMENTS.find((d) => d.id === departmentId) || SEED_DEPARTMENTS[0];
    const initialPriority: IssuePriority = body.priority || 'MEDIUM';
    const now = new Date();
    const slaHours = dept.slaHours[initialPriority] || 24;
    const slaDeadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();
    const newId = `CP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newIssue: Issue = {
      id: newId,
      title: sanitizeInput(title),
      description: sanitizeInput(description),
      category: category as IssueCategory,
      departmentId: dept.id,
      departmentName: dept.name,
      priority: initialPriority,
      status: 'SUBMITTED',
      citizenId: user?.id || 'usr-citizen-sophia',
      citizenName: user?.name || 'Sophia Al-Mansoor',
      citizenEmail: user?.email || 'sophia.citizen@gmail.com',
      citizenPhone: user?.phone || '+1 (555) 011-3390',
      location: {
        address: sanitizeInput(location.address),
        landmark: location.landmark ? sanitizeInput(location.landmark) : undefined,
        lat: Number(location.lat),
        lng: Number(location.lng),
        cityZone: location.cityZone || 'Sector 4 - Downtown',
      },
      photoUrls: photoUrls?.length > 0 ? photoUrls : ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'],
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
          description: `Filed with verified GPS coordinates (${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}).`,
          actorName: user?.name || 'Citizen',
          actorRole: user?.role || 'CITIZEN',
          actorId: user?.id || 'usr-citizen-sophia',
          timestamp: now.toISOString(),
        },
      ],
      upvotes: 1,
    };

    serverIssues = [newIssue, ...serverIssues];
    return NextResponse.json(newIssue, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error creating issue.' }, { status: 500 });
  }
}
