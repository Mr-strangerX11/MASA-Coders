export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailyReport from '@/models/DailyReport';
import { requireStaff, requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = {};

    if (decoded.role === 'staff') filter.userId = decoded.id;
    else {
      const userId = searchParams.get('userId');
      if (userId) filter.userId = userId;
    }

    const date = searchParams.get('date');
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const d2 = new Date(date); d2.setHours(23,59,59,999);
      filter.date = { $gte: d, $lte: d2 };
    }

    const page  = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const [reports, total] = await Promise.all([
      DailyReport.find(filter)
        .populate('userId', 'name email avatar department')
        .populate('tasksCompleted', 'title status')
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      DailyReport.countDocuments(filter),
    ]);

    return NextResponse.json({ reports, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { summary, tasksCompleted, hoursWorked, blockers, nextDayPlan, mood, projectId } = body;

    if (!summary) return NextResponse.json({ error: 'Summary is required.' }, { status: 400 });

    const today = new Date(); today.setHours(0,0,0,0);
    const existing = await DailyReport.findOne({ userId: decoded.id, date: { $gte: today } });
    if (existing) return NextResponse.json({ error: 'You already submitted a report today.' }, { status: 409 });

    const report = await DailyReport.create({
      userId: decoded.id, projectId, date: today,
      summary, tasksCompleted: tasksCompleted || [], hoursWorked: hoursWorked || 0,
      blockers, nextDayPlan, mood: mood || 'good',
      pointsAwarded: 2,
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    console.error('POST /api/daily-reports:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
