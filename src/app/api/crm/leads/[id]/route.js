export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

export async function GET(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const lead = await Lead.findById(params.id).lean();
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ lead: { ...lead, id: lead._id.toString() } });
}

export async function PUT(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const updates = await request.json();
  const allowed = ['status', 'priority', 'company_name', 'estimated_value', 'notes', 'contact_name', 'contact_email', 'contact_phone', 'service', 'budget', 'isRead'];
  const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
  if (!Object.keys(safeUpdates).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  const lead = await Lead.findByIdAndUpdate(params.id, safeUpdates, { new: true }).lean();
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ lead: { ...lead, id: lead._id.toString() } });
}

export async function DELETE(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();
  await Lead.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
