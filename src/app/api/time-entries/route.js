export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';
import { requireStaff } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const taskId    = searchParams.get('taskId');
    const date      = searchParams.get('date'); // YYYY-MM-DD
    const running   = searchParams.get('running');

    const filter = {};
    // Staff see only their own entries
    if (decoded.role === 'staff') filter.userId = decoded.id;
    else {
      const userId = searchParams.get('userId');
      if (userId) filter.userId = userId;
    }

    if (projectId) filter.projectId = projectId;
    if (taskId)    filter.taskId = taskId;
    if (running === 'true') filter.isRunning = true;
    if (date) {
      const d  = new Date(date); d.setHours(0,0,0,0);
      const d2 = new Date(date); d2.setHours(23,59,59,999);
      filter.startTime = { $gte: d, $lte: d2 };
    }

    const entries = await TimeEntry.find(filter)
      .populate('userId', 'name email avatar')
      .populate('taskId', 'title status')
      .populate('projectId', 'title color')
      .sort({ startTime: -1 })
      .limit(100)
      .lean();

    // Compute totals
    const totalMinutes = entries.filter(e => !e.isRunning).reduce((s, e) => s + (e.duration || 0), 0);
    const billableMinutes = entries.filter(e => e.isBillable && !e.isRunning).reduce((s, e) => s + (e.duration || 0), 0);

    return NextResponse.json({ entries, totalMinutes, billableMinutes });
  } catch (err) {
    console.error('GET /api/time-entries:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { action, projectId, taskId, description, isBillable } = body;

    if (action === 'start') {
      // Stop any currently running entry first
      const running = await TimeEntry.findOne({ userId: decoded.id, isRunning: true });
      if (running) {
        const endTime  = new Date();
        const duration = Math.round((endTime - running.startTime) / 60000);
        await TimeEntry.findByIdAndUpdate(running._id, { endTime, duration, isRunning: false });
      }

      if (!projectId) return NextResponse.json({ error: 'Project is required to start timer.' }, { status: 400 });

      const entry = await TimeEntry.create({
        userId: decoded.id, projectId, taskId: taskId || null,
        description: description || '',
        startTime: new Date(), isRunning: true,
        isBillable: isBillable !== false,
      });

      return NextResponse.json({ entry, action: 'started' }, { status: 201 });

    } else if (action === 'stop') {
      const running = await TimeEntry.findOne({ userId: decoded.id, isRunning: true });
      if (!running) return NextResponse.json({ error: 'No timer is currently running.' }, { status: 400 });

      const endTime  = new Date();
      const duration = Math.round((endTime - running.startTime) / 60000);
      const updated  = await TimeEntry.findByIdAndUpdate(
        running._id,
        { endTime, duration, isRunning: false, description: description || running.description },
        { new: true }
      ).populate('taskId', 'title').populate('projectId', 'title color');

      return NextResponse.json({ entry: updated, action: 'stopped' });

    } else if (action === 'manual') {
      // Manual log without start/stop
      const { startTime, endTime, duration } = body;
      if (!startTime || !projectId) return NextResponse.json({ error: 'Start time and project required.' }, { status: 400 });

      const mins = duration || (endTime ? Math.round((new Date(endTime) - new Date(startTime)) / 60000) : 0);
      const entry = await TimeEntry.create({
        userId: decoded.id, projectId, taskId: taskId || null,
        description: description || '',
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration: mins, isRunning: false,
        isBillable: isBillable !== false,
      });

      return NextResponse.json({ entry }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid action. Use start, stop, or manual.' }, { status: 400 });
  } catch (err) {
    console.error('POST /api/time-entries:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
