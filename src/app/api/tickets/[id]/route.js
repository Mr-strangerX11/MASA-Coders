export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Notification from '@/models/Notification';
import { requireAnyAuth, requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import { emailTicketReplied, emailTicketResolved } from '@/lib/sendPlatformEmail';

export async function GET(request, { params }) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const ticket = await Ticket.findById(params.id)
      .populate('clientId', 'name email avatar company')
      .populate('assignedTo', 'name email avatar')
      .populate('messages.senderId', 'name email avatar role')
      .lean();

    if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
    if (decoded.role === 'client' && ticket.clientId?._id?.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    return NextResponse.json({ ticket });
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

    const ticket = await Ticket.findById(params.id);
    if (!ticket) return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });

    // Add message if provided
    if (body.message) {
      const isInternal = body.isInternal && decoded.role !== 'client';
      ticket.messages.push({
        senderId: decoded.id,
        senderRole: ['admin', 'editor', 'manager'].includes(decoded.role) ? 'admin' : decoded.role,
        content: body.message,
        attachments: body.attachments || [],
        isInternal,
      });
      ticket.updatedAt = new Date();
      if (!ticket.firstResponseAt && decoded.role !== 'client') ticket.firstResponseAt = new Date();
    }

    // Status update
    if (body.status) {
      ticket.status = body.status;
      if (body.status === 'resolved') ticket.resolvedAt = new Date();
      if (body.status === 'closed') ticket.closedAt = new Date();
    }
    if (body.assignedTo !== undefined) ticket.assignedTo = body.assignedTo;
    if (body.priority) ticket.priority = body.priority;
    if (body.satisfactionRating) {
      ticket.satisfactionRating = body.satisfactionRating;
      ticket.satisfactionNote = body.satisfactionNote || '';
    }

    await ticket.save();

    // Notify + email on reply
    if (body.message && !body.isInternal) {
      const notifyUserId = decoded.role === 'client' ? ticket.assignedTo : ticket.clientId;
      if (notifyUserId) {
        await Notification.create({
          userId: notifyUserId,
          type: 'ticket_reply',
          title: 'New reply on support ticket',
          body: `${ticket.ticketNumber}: ${ticket.subject}`,
          link: decoded.role === 'client' ? `/admin/tickets/${ticket._id}` : `/client/tickets/${ticket._id}`,
        });
        // Send email to the notified party
        const recipient = await User.findById(notifyUserId).lean();
        if (recipient) {
          emailTicketReplied(recipient, ticket, body.message, decoded.role === 'client' ? 'Client' : 'Support Team').catch(() => {});
        }
      }
    }

    // Email on resolve
    if (body.status === 'resolved') {
      const client = await User.findById(ticket.clientId).lean();
      if (client) emailTicketResolved(client, ticket).catch(() => {});
    }

    const updated = await Ticket.findById(params.id)
      .populate('clientId', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('messages.senderId', 'name email avatar role');

    return NextResponse.json({ ticket: updated });
  } catch (err) {
    console.error('PATCH /api/tickets/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
