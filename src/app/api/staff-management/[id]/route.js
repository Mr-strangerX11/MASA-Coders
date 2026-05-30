export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Attendance from '@/models/Attendance';
import DailyReport from '@/models/DailyReport';
import { requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const user = await User.findById(params.id).lean();
    if (!user) return NextResponse.json({ error: 'Staff not found.' }, { status: 404 });

    // Fetch stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [taskStats, reportCount, attendanceCount] = await Promise.all([
      Task.aggregate([
        { $match: { assigneeIds: user._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      DailyReport.countDocuments({ userId: user._id, date: { $gte: monthStart } }),
      Attendance.countDocuments({ userId: user._id, date: { $gte: monthStart }, status: { $in: ['present', 'wfh', 'half_day'] } }),
    ]);

    const taskBreakdown = { total: 0, done: 0, in_progress: 0, todo: 0, overdue: 0 };
    taskStats.forEach(s => {
      taskBreakdown.total += s.count;
      taskBreakdown[s._id] = s.count;
    });

    const { password, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, stats: { taskBreakdown, reportCount, attendanceCount } });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    // Never allow password update via this route
    delete body.password;

    const user = await User.findByIdAndUpdate(params.id, { $set: body }, { new: true, runValidators: true });
    if (!user) return NextResponse.json({ error: 'Staff not found.' }, { status: 404 });

    return NextResponse.json({ user: user.toJSON() });
  } catch (err) {
    console.error('PATCH /api/staff-management/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    // Soft delete — deactivate instead of hard delete
    const user = await User.findByIdAndUpdate(params.id, { isActive: false }, { new: true });
    if (!user) return NextResponse.json({ error: 'Staff not found.' }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
