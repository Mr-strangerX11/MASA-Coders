import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryRows, queryOne } from '@/lib/db/postgres';
import { rateLimit } from '@/lib/rateLimit';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

/** GET /api/inbox — List conversations with filters + pagination */
export async function GET(request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page      = Math.max(1, parseInt(searchParams.get('page')     || '1'));
  const limit     = Math.min(50, parseInt(searchParams.get('limit')    || '20'));
  const platform  = searchParams.get('platform');
  const status    = searchParams.get('status');
  const intent    = searchParams.get('intent');
  const search    = searchParams.get('search');
  const skip      = (page - 1) * limit;

  const conditions = ['cv.is_archived = false'];
  const params     = [];

  if (platform) { params.push(platform); conditions.push(`cv.platform = $${params.length}`); }
  if (status)   { params.push(status);   conditions.push(`cv.status = $${params.length}`); }
  if (intent)   { params.push(intent);   conditions.push(`cv.intent = $${params.length}`); }
  if (search)   {
    params.push(`%${search}%`);
    conditions.push(`(c.name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit, skip);
  const rows = await queryRows(
    `SELECT cv.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone, c.avatar_url
     FROM conversations cv
     JOIN contacts c ON c.id = cv.contact_id
     ${where}
     ORDER BY cv.last_message_at DESC NULLS LAST
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  // Unread count for badge
  const unreadResult = await queryOne(`SELECT COUNT(*) as count FROM conversations WHERE unread_count > 0 AND is_archived = false`);

  return NextResponse.json({
    conversations: rows,
    unreadTotal:   parseInt(unreadResult?.count || 0),
    page,
    limit,
  });
}
