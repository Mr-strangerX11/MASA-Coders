export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';
import WorkProject from '@/models/WorkProject';
import Task from '@/models/Task';
import Ticket from '@/models/Ticket';
import Lead from '@/models/Lead';
import Inquiry from '@/models/Inquiry';
import Invoice from '@/models/Invoice';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/apiHelpers';

// GET /api/search?q=...&limit=10
export async function GET(request) {
  const decoded = await requireAdmin(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const ip = getClientIp(request);
  const { ok } = rateLimit(`search:${ip}`, 30, 60);
  if (!ok) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const q     = searchParams.get('q')?.trim();
  const limit = Math.min(5, parseInt(searchParams.get('limit') || '5'));

  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  await connectDB();

  const re = new RegExp(q, 'i');
  const lim = limit;

  const [users, projects, tasks, tickets, leads, inquiries, invoices] = await Promise.all([
    User.find({ $or: [{ name: re }, { email: re }, { company: re }] })
      .select('name email role company').limit(lim).lean(),
    WorkProject.find({ $or: [{ title: re }, { description: re }] })
      .select('title status').limit(lim).lean(),
    Task.find({ $or: [{ title: re }, { description: re }] })
      .select('title status column projectId').limit(lim).lean(),
    Ticket.find({ $or: [{ title: re }, { subject: re }] })
      .select('title status priority').limit(lim).lean(),
    Lead.find({ $or: [{ contact_name: re }, { contact_email: re }, { company_name: re }] })
      .select('contact_name contact_email status priority').limit(lim).lean(),
    Inquiry.find({ $or: [{ name: re }, { email: re }, { subject: re }] })
      .select('name email subject').limit(lim).lean(),
    Invoice.find({ $or: [{ invoiceNumber: re }, { clientName: re }] })
      .select('invoiceNumber status total').limit(lim).lean(),
  ]);

  const results = [
    ...users.map(u => ({ type: 'user', id: u._id, label: u.name, sub: u.email, badge: u.role, url: `/admin/users` })),
    ...projects.map(p => ({ type: 'project', id: p._id, label: p.title, sub: p.status, badge: 'project', url: `/admin/work-projects/${p._id}` })),
    ...tasks.map(t => ({ type: 'task', id: t._id, label: t.title, sub: t.column, badge: t.status, url: `/admin/work-projects/${t.projectId}` })),
    ...tickets.map(t => ({ type: 'ticket', id: t._id, label: t.title || t.subject, sub: t.status, badge: t.priority, url: `/admin/tickets/${t._id}` })),
    ...leads.map(l => ({ type: 'lead', id: l._id, label: l.contact_name, sub: l.contact_email, badge: l.status, url: `/admin/crm` })),
    ...inquiries.map(i => ({ type: 'inquiry', id: i._id, label: i.name, sub: i.email, badge: 'inquiry', url: `/admin/inquiries` })),
    ...invoices.map(i => ({ type: 'invoice', id: i._id, label: i.invoiceNumber, sub: `$${i.total}`, badge: i.status, url: `/admin/finance` })),
  ];

  return NextResponse.json({ results, query: q });
}
