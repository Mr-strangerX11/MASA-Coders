export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Approval from '@/models/Approval';
import Notification from '@/models/Notification';
import { requireAnyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status   = searchParams.get('status');
    const type     = searchParams.get('type');
    const page     = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit    = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const filter = {};

    // Clients only see approvals assigned to them or that need their approval
    if (decoded.role === 'client') {
      filter.$or = [{ clientId: decoded.id }, { requestedBy: decoded.id }];
    }
    // Staff see their own requests + requests where they are approver
    if (decoded.role === 'staff') {
      filter.$or = [{ requestedBy: decoded.id }, { approvers: decoded.id }];
    }

    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const [approvals, total] = await Promise.all([
      Approval.find(filter)
        .populate('requestedBy', 'name email avatar role')
        .populate('reviewedBy', 'name email avatar')
        .populate('approvers', 'name email avatar')
        .populate('clientId', 'name email company avatar')
        .populate('projectId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Approval.countDocuments(filter),
    ]);

    return NextResponse.json({ approvals, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET /api/approvals:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const {
      type, title, description, priority, approvers, dueDate,
      projectId, taskId, invoiceId, leaveRequestId,
      attachments, requiresClientApproval, clientId,
    } = body;

    if (!type || !title) {
      return NextResponse.json({ error: 'Type and title are required.' }, { status: 400 });
    }

    const approval = await Approval.create({
      type, title, description, priority, requestedBy: decoded.id,
      approvers: approvers || [],
      dueDate, projectId, taskId, invoiceId, leaveRequestId,
      attachments: attachments || [],
      requiresClientApproval: requiresClientApproval || false,
      clientId,
    });

    // Notify all approvers
    const notifyIds = [...(approvers || [])];
    if (requiresClientApproval && clientId) notifyIds.push(clientId);

    if (notifyIds.length) {
      await Notification.insertMany(
        notifyIds.map(uid => ({
          userId: uid,
          type: 'approval_request',
          title: `Approval needed: ${title}`,
          body: `${type.replace('_', ' ')} — ${description || title}`,
          link: decoded.role === 'client'
            ? `/client/approvals/${approval._id}`
            : `/admin/approvals/${approval._id}`,
        }))
      );
    }

    const populated = await Approval.findById(approval._id)
      .populate('requestedBy', 'name email avatar')
      .populate('approvers', 'name email avatar');

    return NextResponse.json({ approval: populated }, { status: 201 });
  } catch (err) {
    console.error('POST /api/approvals:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
