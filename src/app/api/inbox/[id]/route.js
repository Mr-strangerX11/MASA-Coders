import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryOne, queryRows } from '@/lib/db/postgres';
import { publish } from '@/lib/db/redis';
import { enqueueOutbound } from '@/lib/queue/index';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

/** GET /api/inbox/:id — Conversation detail with messages + AI suggestions */
export async function GET(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;

  const [conv, messages, suggestions] = await Promise.all([
    queryOne(
      `SELECT cv.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone, c.avatar_url
       FROM conversations cv JOIN contacts c ON c.id = cv.contact_id WHERE cv.id = $1`,
      [id]
    ),
    queryRows(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [id]
    ),
    queryRows(
      `SELECT * FROM ai_suggestions WHERE conversation_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 3`,
      [id]
    ),
  ]);

  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Mark as read
  await queryOne(`UPDATE conversations SET unread_count = 0 WHERE id = $1`, [id]);

  return NextResponse.json({ conversation: conv, messages, suggestions });
}

/** PUT /api/inbox/:id — Update status, mode, assigned_to */
export async function PUT(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = params;
  const body   = await request.json();

  const allowed = ['status', 'ai_mode', 'assigned_to', 'priority', 'is_archived'];
  const sets    = [];
  const vals    = [];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      vals.push(body[key]);
      sets.push(`${key} = $${vals.length}`);
    }
  }
  if (!sets.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  vals.push(id);
  const conv = await queryOne(
    `UPDATE conversations SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`,
    vals
  );

  await publish('inbox:conv_updated', { conversationId: id, changes: body });
  return NextResponse.json({ conversation: conv });
}

/** POST /api/inbox/:id/send — Agent manually sends a message */
export async function POST(request, { params }) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id }   = params;
  const { text, suggestionId } = await request.json();
  if (!text?.trim()) return NextResponse.json({ error: 'text is required' }, { status: 400 });

  const conv = await queryOne(
    `SELECT cv.platform, pp.platform_user_id FROM conversations cv
     JOIN platform_profiles pp ON pp.contact_id = cv.contact_id AND pp.platform = cv.platform
     WHERE cv.id = $1`,
    [id]
  );
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Mark suggestion as approved if provided
  if (suggestionId) {
    await queryOne(`UPDATE ai_suggestions SET status = 'approved', approved_by = 'admin' WHERE id = $1`, [suggestionId]);
  }

  await enqueueOutbound(conv.platform, conv.platform_user_id, text, id);

  // Persist immediately so UI updates in real-time
  const msg = await queryOne(
    `INSERT INTO messages (conversation_id, direction, sender_type, content, ai_suggested, status)
     VALUES ($1,'outbound','agent',$2,$3,'pending') RETURNING *`,
    [id, text, !!suggestionId]
  );

  await queryOne(
    `UPDATE conversations SET last_message_at = NOW(), last_message_preview = $1, updated_at = NOW() WHERE id = $2`,
    [text.slice(0, 100), id]
  );

  await publish('inbox:message_sent', { conversationId: id, message: msg });
  return NextResponse.json({ message: msg });
}
