export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Notification from '@/models/Notification';
import { requireStaff, requireAdmin } from '@/lib/auth';

// GET /api/tasks?projectId=&column=&assigneeId=&status=&sprint=
export async function GET(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const projectId  = searchParams.get('projectId');
    const column     = searchParams.get('column');
    const assigneeId = searchParams.get('assigneeId');
    const status     = searchParams.get('status');
    const sprint     = searchParams.get('sprint');

    const filter = {};
    if (projectId)  filter.projectId = projectId;
    if (column)     filter.column = column;
    if (status)     filter.status = status;
    if (sprint)     filter.sprint = parseInt(sprint);
    if (assigneeId) filter.assigneeIds = assigneeId;

    // Staff only see their own tasks
    if (decoded.role === 'staff') filter.assigneeIds = decoded.id;

    const tasks = await Task.find(filter)
      .populate('assigneeIds', 'name email avatar')
      .populate('reporterId', 'name email avatar')
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({ tasks });
  } catch (err) {
    console.error('GET /api/tasks:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST /api/tasks
export async function POST(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { projectId, title, description, column, priority, type, assigneeIds, dueDate, estimatedHours, sprint, storyPoints, tags } = body;

    if (!projectId || !title) return NextResponse.json({ error: 'Project and title are required.' }, { status: 400 });

    // Get max order in column
    const lastTask = await Task.findOne({ projectId, column: column || 'Backlog' }).sort({ order: -1 });
    const order = (lastTask?.order || 0) + 1;

    const task = await Task.create({
      projectId, title, description, column: column || 'Backlog',
      status: 'backlog', priority, type, assigneeIds, reporterId: decoded.id,
      dueDate, estimatedHours, sprint, storyPoints, tags, order,
    });

    // Notify assignees
    if (assigneeIds?.length) {
      const notifications = assigneeIds.map(uid => ({
        userId: uid,
        type: 'task_assigned',
        title: 'New task assigned to you',
        body: title,
        link: `/staff/tasks?task=${task._id}`,
      }));
      await Notification.insertMany(notifications);
    }

    const populated = await Task.findById(task._id)
      .populate('assigneeIds', 'name email avatar')
      .populate('reporterId', 'name email avatar');

    return NextResponse.json({ task: populated }, { status: 201 });
  } catch (err) {
    console.error('POST /api/tasks:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
