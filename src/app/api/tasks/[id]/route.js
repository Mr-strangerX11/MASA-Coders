export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import WorkProject from '@/models/WorkProject';
import Notification from '@/models/Notification';
import { requireStaff } from '@/lib/auth';

// GET /api/tasks/:id
export async function GET(request, { params }) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const task = await Task.findById(params.id)
      .populate('assigneeIds', 'name email avatar jobTitle')
      .populate('reporterId', 'name email avatar')
      .populate('approvedBy', 'name email avatar')
      .populate('comments.userId', 'name email avatar role')
      .lean();

    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    return NextResponse.json({ task });
  } catch (err) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/tasks/:id
export async function PATCH(request, { params }) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();

    // Handle column/status move (kanban drag)
    if (body.column && !body.status) {
      const columnStatusMap = { 'Backlog': 'backlog', 'To Do': 'todo', 'In Progress': 'in_progress', 'Review': 'review', 'Done': 'done' };
      body.status = columnStatusMap[body.column] || body.column.toLowerCase().replace(' ', '_');
    }

    // Auto-set completedAt
    if (body.status === 'done' && !body.completedAt) body.completedAt = new Date();
    if (body.status !== 'done') body.completedAt = null;

    const task = await Task.findByIdAndUpdate(params.id, { $set: body }, { new: true, runValidators: true })
      .populate('assigneeIds', 'name email avatar')
      .populate('reporterId', 'name email avatar');

    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    // Notify on completion
    if (body.status === 'done') {
      const project = await WorkProject.findById(task.projectId);
      if (project?.clientId) {
        await Notification.create({
          userId: project.clientId,
          type: 'task_completed',
          title: 'A task has been completed',
          body: task.title,
          link: `/client/projects/${task.projectId}`,
        });
      }
    }

    return NextResponse.json({ task });
  } catch (err) {
    console.error('PATCH /api/tasks/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// DELETE /api/tasks/:id (admin only)
export async function DELETE(request, { params }) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded || !['admin', 'manager', 'editor'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await connectDB();
    const task = await Task.findByIdAndDelete(params.id);
    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST /api/tasks/:id/comment — via action param
export async function POST(request, { params }) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { content, attachments } = await request.json();
    if (!content?.trim()) return NextResponse.json({ error: 'Comment cannot be empty.' }, { status: 400 });

    const task = await Task.findByIdAndUpdate(
      params.id,
      { $push: { comments: { userId: decoded.id, content, attachments: attachments || [] } } },
      { new: true }
    ).populate('comments.userId', 'name email avatar role');

    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });
    const newComment = task.comments[task.comments.length - 1];
    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
