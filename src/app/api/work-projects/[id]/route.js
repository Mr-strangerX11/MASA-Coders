export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WorkProject from '@/models/WorkProject';
import Task from '@/models/Task';
import { requireAdmin, requireAnyAuth } from '@/lib/auth';

// GET /api/work-projects/:id
export async function GET(request, { params }) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const project = await WorkProject.findById(params.id)
      .populate('clientId', 'name email avatar company phone')
      .populate('managerId', 'name email avatar jobTitle')
      .populate('teamIds', 'name email avatar jobTitle department')
      .lean();

    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

    // Access check
    if (decoded.role === 'client' && project.clientId?._id?.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    if (decoded.role === 'staff') {
      const isTeam = project.teamIds?.some(m => m._id?.toString() === decoded.id);
      const isManager = project.managerId?._id?.toString() === decoded.id;
      if (!isTeam && !isManager) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // Attach task breakdown
    const tasks = await Task.find({ projectId: params.id }).lean();
    const breakdown = {
      total: tasks.length,
      backlog: tasks.filter(t => t.status === 'backlog').length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
    };

    return NextResponse.json({ project: { ...project, taskBreakdown: breakdown } });
  } catch (err) {
    console.error('GET /api/work-projects/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/work-projects/:id
export async function PATCH(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const project = await WorkProject.findByIdAndUpdate(params.id, { $set: body }, { new: true, runValidators: true })
      .populate('clientId', 'name email avatar company')
      .populate('managerId', 'name email avatar')
      .populate('teamIds', 'name email avatar');

    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    return NextResponse.json({ project });
  } catch (err) {
    console.error('PATCH /api/work-projects/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// DELETE /api/work-projects/:id
export async function DELETE(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const project = await WorkProject.findByIdAndDelete(params.id);
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

    // Cascade delete tasks
    await Task.deleteMany({ projectId: params.id });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/work-projects/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
