export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LeaveRequest from '@/models/LeaveRequest';
import Notification from '@/models/Notification';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import { emailLeaveResult } from '@/lib/sendPlatformEmail';

export async function PATCH(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { status, reviewNote } = await request.json();
    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const leaveReq = await LeaveRequest.findByIdAndUpdate(
      params.id,
      { status, reviewNote: reviewNote || '', reviewedBy: decoded.id, reviewedAt: new Date() },
      { new: true }
    ).populate('userId', 'name email');

    if (!leaveReq) return NextResponse.json({ error: 'Leave request not found.' }, { status: 404 });

    await Notification.create({
      userId: leaveReq.userId._id,
      type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
      title: `Leave request ${status}`,
      body: `Your ${leaveReq.type} leave has been ${status}.`,
      link: '/staff/leaves',
    });

    // Send email to staff member
    const staff = await User.findById(leaveReq.userId._id).lean();
    if (staff) emailLeaveResult(staff, leaveReq).catch(() => {});

    return NextResponse.json({ request: leaveReq });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
