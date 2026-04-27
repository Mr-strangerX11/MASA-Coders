import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryRows, queryOne } from '@/lib/db/postgres';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

/** GET /api/crm/leads */
export async function GET(request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status   = searchParams.get('status');
  const platform = searchParams.get('platform');
  const page     = Math.max(1, parseInt(searchParams.get('page')  || '1'));
  const limit    = Math.min(200, parseInt(searchParams.get('limit') || '25'));
  const skip     = (page - 1) * limit;

  const conditions = [];
  const params     = [];

  if (status)   { params.push(status);   conditions.push(`l.status = $${params.length}`); }
  if (platform) { params.push(platform); conditions.push(`l.source_platform = $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const filterParams = [...params];
  params.push(limit, skip);

  const [leads, countRow, statsRow] = await Promise.all([
    queryRows(
      `SELECT l.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone, c.avatar_url,
              cv.platform, cv.last_message_at
       FROM leads l
       JOIN contacts c ON c.id = l.contact_id
       LEFT JOIN conversations cv ON cv.id = l.conversation_id
       ${where}
       ORDER BY l.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    ),
    queryOne(`SELECT COUNT(*) as count FROM leads l ${where}`, filterParams),
    queryOne(
      `SELECT
         COUNT(*) FILTER (WHERE l.status = 'won') AS won,
         COALESCE(SUM(l.estimated_value) FILTER (WHERE l.status = 'won'), 0) AS revenue
       FROM leads l ${where}`,
      filterParams
    ),
  ]);

  const total = parseInt(countRow?.count || 0);

  return NextResponse.json({
    leads,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    stats: {
      won:     parseInt(statsRow?.won     || 0),
      revenue: parseFloat(statsRow?.revenue || 0),
    },
  });
}

/** POST /api/crm/leads — create a lead manually */
export async function POST(request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { contact_name, contact_email, contact_phone, company_name, notes, priority, estimated_value, status } = body;
  if (!contact_name?.trim()) return NextResponse.json({ error: 'contact_name required' }, { status: 400 });

  // Upsert contact
  let contact = await queryOne(
    `INSERT INTO contacts (name, email, phone, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
     RETURNING *`,
    [contact_name.trim(), contact_email || null, contact_phone || null]
  );

  const lead = await queryOne(
    `INSERT INTO leads (contact_id, status, priority, company_name, notes, estimated_value, source_platform, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 'manual', NOW(), NOW())
     RETURNING *`,
    [
      contact.id,
      status || 'new',
      priority || 'medium',
      company_name || null,
      notes || null,
      estimated_value ? parseFloat(estimated_value) : null,
    ]
  );

  return NextResponse.json({ lead: { ...lead, contact_name: contact.name, contact_email: contact.email, contact_phone: contact.phone } }, { status: 201 });
}
