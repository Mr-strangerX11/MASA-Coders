export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Approval from '@/models/Approval';
import Notification from '@/models/Notification';
import LeaveRequest from '@/models/LeaveRequest';
import Task from '@/models/Task';
import { requireAnyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const approval = await Approval.findById(params.id)
      .populate('requestedBy', 'name email avatar role department jobTitle')
      .populate('reviewedBy', 'name email avatar')
      .populate('approvers', 'name email avatar role')
      .populate('clientId', 'name email company avatar')
      .populate('projectId', 'title color')
      .populate('taskId', 'title status')
      .lean();

    if (!approval) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    return NextResponse.json({ approval });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { action, reviewNote, attachments } = body;

    const approval = await Approval.findById(params.id);
    if (!approval) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    if (action === 'approve') {
      approval.status    = 'approved';
      approval.reviewedBy  = decoded.id;
      approval.reviewNote  = reviewNote || '';
      approval.reviewedAt  = new Date();

      // Side effects
      if (approval.type === 'leave' && approval.leaveRequestId) {
        await LeaveRequest.findByIdAndUpdate(approval.leaveRequestId, {
          status: 'approved', reviewedBy: decoded.id, reviewNote: reviewNote || '', reviewedAt: new Date(),
        });
      }
      if (approval.type === 'task' && approval.taskId) {
        await Task.findByIdAndUpdate(approval.taskId, { isApproved: true, approvedBy: decoded.id, approvedAt: new Date(), pointsAwarded: 8 });
      }

      // Notify requester
      await Notification.create({
        userId: approval.requestedBy,
        type: 'approval_done',
        title: `✅ Approved: ${approval.title}`,
        body: reviewNote || `Your ${approval.type.replace('_', ' ')} was approved.`,
        link: `/staff/dashboard`,
      });

    } else if (action === 'reject') {
      approval.status    = 'rejected';
      approval.reviewedBy  = decoded.id;
      approval.reviewNote  = reviewNote || '';
      approval.reviewedAt  = new Date();

      if (approval.type === 'leave' && approval.leaveRequestId) {
        await LeaveRequest.findByIdAndUpdate(approval.leaveRequestId, {
          status: 'rejected', reviewedBy: decoded.id, reviewNote: reviewNote || '', reviewedAt: new Date(),
        });
      }

      await Notification.create({
        userId: approval.requestedBy,
        type: 'approval_done',
        title: `❌ Rejected: ${approval.title}`,
        body: reviewNote || `Your ${approval.type.replace('_', ' ')} was rejected.`,
        link: `/staff/dashboard`,
      });

    } else if (action === 'request_revision') {
      approval.status = 'revision_requested';
      approval.revisions.push({ note: reviewNote, requestedBy: decoded.id });

      await Notification.create({
        userId: approval.requestedBy,
        type: 'approval_done',
        title: `🔁 Revision requested: ${approval.title}`,
        body: reviewNote,
        link: `/admin/approvals/${approval._id}`,
      });

    } else if (body.attachments) {
      // Staff uploads revised files
      approval.attachments.push(...(attachments || []));
      approval.status = 'pending';
    }

    await approval.save();

    const updated = await Approval.findById(params.id)
      .populate('requestedBy', 'name email avatar')
      .populate('reviewedBy', 'name email avatar')
      .populate('approvers', 'name email avatar');

    return NextResponse.json({ approval: updated });
  } catch (err) {
    console.error('PATCH /api/approvals/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    await Approval.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
