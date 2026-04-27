import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryRows } from '@/lib/db/postgres';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

/** GET /api/inbox/:id/messages?before=<cursor>&limit=30 — Paginated messages */
export async function GET(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const limit  = Math.min(100, parseInt(searchParams.get('limit') || '50'));
  const before = searchParams.get('before'); // ISO timestamp cursor

  const messages = await queryRows(
    `SELECT * FROM messages
     WHERE conversation_id = $1
       ${before ? `AND created_at < $2` : ''}
     ORDER BY created_at DESC
     LIMIT ${before ? '$3' : '$2'}`,
    before ? [id, before, limit] : [id, limit]
  );

  return NextResponse.json({ messages: messages.reverse() });
}
