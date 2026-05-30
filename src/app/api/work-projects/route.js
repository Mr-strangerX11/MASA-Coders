export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorkProject from '@/models/WorkProject';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { requireAdmin, requireAnyAuth } from '@/lib/auth';

// GET /api/work-projects
export async function GET(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit  = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const filter = {};

    // Clients only see their own projects
    if (decoded.role === 'client') {
      filter.clientId = decoded.id;
      filter.isClientVisible = true;
    }
    // Staff only see assigned projects
    if (decoded.role === 'staff') {
      filter.$or = [{ teamIds: decoded.id }, { managerId: decoded.id }];
    }
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const [projects, total] = await Promise.all([
      WorkProject.find(filter)
        .populate('clientId', 'name email avatar company')
        .populate('managerId', 'name email avatar')
        .populate('teamIds', 'name email avatar jobTitle')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WorkProject.countDocuments(filter),
    ]);

    // Attach task counts
    const projectIds = projects.map(p => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } },
    ]);
    const countMap = Object.fromEntries(taskCounts.map(t => [t._id.toString(), t]));
    const enriched = projects.map(p => ({ ...p, taskCount: countMap[p._id.toString()]?.total || 0, doneCount: countMap[p._id.toString()]?.done || 0 }));

    return NextResponse.json({ projects: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET /api/work-projects:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST /api/work-projects (admin/manager only)
export async function POST(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { title, description, clientId, managerId, teamIds, startDate, deadline, budget, currency, priority, type, color, columns } = body;

    if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

    const project = await WorkProject.create({
      title, description, clientId, managerId: managerId || decoded.id,
      teamIds: teamIds || [], startDate, deadline, budget, currency,
      priority, type, color, columns,
    });

    // Notify assigned team members
    if (teamIds?.length) {
      const notifications = teamIds.map(uid => ({
        userId: uid,
        type: 'project_update',
        title: 'You have been assigned to a project',
        body: `You have been added to "${title}"`,
        link: `/staff/projects/${project._id}`,
      }));
      await Notification.insertMany(notifications);
    }

    // Notify client
    if (clientId) {
      await Notification.create({
        userId: clientId,
        type: 'project_update',
        title: 'New project started for you',
        body: `Your project "${title}" has been created.`,
        link: `/client/projects/${project._id}`,
      });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error('POST /api/work-projects:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
