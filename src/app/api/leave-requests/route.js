export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import Notification from '@/models/Notification';
import User from '@/models/User';
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
      const status = searchParams.get('status');
      if (status) filter.status = status;
    }

    const requests = await LeaveRequest.find(filter)
      .populate('userId', 'name email avatar department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { type, startDate, endDate, reason } = await request.json();
    if (!type || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    const days  = Math.max(1, Math.ceil((end - start) / 86400000) + 1);

    const leaveReq = await LeaveRequest.create({
      userId: decoded.id, type, startDate: start, endDate: end, days, reason,
    });

    // Notify admin
    const admins = await User.find({ role: { $in: ['admin', 'manager'] }, isActive: true }).select('_id').lean();
    if (admins.length) {
      const notifications = admins.map(a => ({
        userId: a._id,
        type: 'approval_request',
        title: 'Leave request submitted',
        body: `${type} leave — ${days} day(s)`,
        link: `/admin/staff`,
      }));
      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ request: leaveReq }, { status: 201 });
  } catch (err) {
    console.error('POST /api/leave-requests:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
