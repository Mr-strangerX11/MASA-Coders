export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { logger } from '@/lib/logger';

// GET /api/crm/leads
export async function GET(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.min(200, parseInt(searchParams.get('limit') || '25'));

    const query = {};
    if (status) query.status = status;

    const [leads, total, wonStats] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Lead.countDocuments(query),
      Lead.aggregate([
        { $match: { status: 'won' } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$estimated_value' } } },
      ]),
    ]);

    return NextResponse.json({
      leads: leads.map(l => ({ ...l, id: l._id.toString() })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      stats: { won: wonStats[0]?.count || 0, revenue: wonStats[0]?.revenue || 0 },
    });
  } catch (err) {
    logger.error('CRM leads GET error', { error: err.message });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST /api/crm/leads
export async function POST(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    if (!body.contact_name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });

    const lead = await Lead.create({
      contact_name:    body.contact_name.trim(),
      contact_email:   body.contact_email?.trim()   || '',
      contact_phone:   body.contact_phone?.trim()   || '',
      company_name:    body.company_name?.trim()    || '',
      service:         body.service                 || '',
      budget:          body.budget                  || '',
      message:         body.message?.trim()         || '',
      notes:           body.notes?.trim()           || '',
      source:          body.source                  || 'manual',
      status:          body.status                  || 'new',
      priority:        body.priority                || 'medium',
      estimated_value: Number(body.estimated_value) || 0,
    });

    return NextResponse.json({ lead: { ...lead.toJSON(), id: lead._id.toString() } }, { status: 201 });
  } catch (err) {
    logger.error('CRM leads POST error', { error: err.message });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
