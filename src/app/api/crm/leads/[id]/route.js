import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryOne } from '@/lib/db/postgres';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

export async function GET(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const lead = await queryOne(
    `SELECT l.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone,
            cv.platform, cv.last_message_at, cv.intent, cv.sentiment
     FROM leads l
     JOIN contacts c ON c.id = l.contact_id
     LEFT JOIN conversations cv ON cv.id = l.conversation_id
     WHERE l.id = $1`,
    [params.id]
  );
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PUT(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const updates = await request.json();
  const allowed = ['status', 'pipeline_stage', 'priority', 'company_name', 'assigned_to', 'estimated_value', 'notes', 'follow_up_at', 'converted_at', 'tags'];
  const sets = [], vals = [];
  for (const key of allowed) {
    if (updates[key] !== undefined) { vals.push(updates[key]); sets.push(`${key} = $${vals.length}`); }
  }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  vals.push(params.id);
  const lead = await queryOne(`UPDATE leads SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`, vals);
  return NextResponse.json({ lead });
}

export async function DELETE(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await queryOne(`DELETE FROM leads WHERE id = $1`, [params.id]);
  return NextResponse.json({ success: true });
}
