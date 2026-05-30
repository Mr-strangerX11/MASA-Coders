export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Notification from '@/models/Notification';
import { requireAnyAuth, requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import { emailTicketCreated } from '@/lib/sendPlatformEmail';

function nextTicketNumber() {
  return `TKT-${String(Date.now()).slice(-7)}`;
}

export async function GET(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const filter = {};

    if (decoded.role === 'client') filter.clientId = decoded.id;
    else {
      const clientId = searchParams.get('clientId');
      const assignedTo = searchParams.get('assignedTo');
      if (clientId) filter.clientId = clientId;
      if (assignedTo) filter.assignedTo = assignedTo;
    }

    const status   = searchParams.get('status');
    const priority = searchParams.get('priority');
    if (status)   filter.status = status;
    if (priority) filter.priority = priority;

    const page  = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('clientId', 'name email avatar company')
        .populate('assignedTo', 'name email avatar')
        .populate('projectId', 'title')
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-messages')
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    return NextResponse.json({ tickets, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET /api/tickets:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { subject, description, category, priority, projectId, attachments } = body;

    if (!subject || !description) return NextResponse.json({ error: 'Subject and description are required.' }, { status: 400 });

    const clientId = decoded.role === 'client' ? decoded.id : body.clientId;
    if (!clientId) return NextResponse.json({ error: 'Client ID required.' }, { status: 400 });

    const ticket = await Ticket.create({
      ticketNumber: nextTicketNumber(),
      subject, description, category, priority,
      clientId, projectId,
      attachments: attachments || [],
      messages: [{
        senderId: decoded.id,
        senderRole: decoded.role === 'client' ? 'client' : 'admin',
        content: description,
        attachments: attachments || [],
      }],
    });

    // Notify creator
    await Notification.create({
      userId: decoded.id,
      type: 'ticket_reply',
      title: 'Support ticket created',
      body: subject,
      link: decoded.role === 'client' ? `/client/tickets/${ticket._id}` : `/admin/tickets/${ticket._id}`,
    });

    // Email confirmation to client
    if (decoded.role === 'client') {
      const client = await User.findById(decoded.id).lean();
      if (client) emailTicketCreated(client, ticket).catch(() => {});
    }

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    console.error('POST /api/tickets:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
