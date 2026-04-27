import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryRows, queryOne } from '@/lib/db/postgres';
import { generateSuggestion } from '@/lib/ai/engine';
import { rateLimit } from '@/lib/rateLimit';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

/** POST /api/ai/suggest — Manually request an AI suggestion for a conversation */
export async function POST(request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const { allowed } = rateLimit(`ai:suggest:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  const { conversationId } = await request.json();
  if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 });

  const [messages, conv] = await Promise.all([
    queryRows(
      `SELECT direction, sender_type, content FROM messages
       WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [conversationId]
    ),
    queryOne(
      `SELECT c.name FROM conversations cv JOIN contacts c ON c.id = cv.contact_id WHERE cv.id = $1`,
      [conversationId]
    ),
  ]);

  if (!messages.length) return NextResponse.json({ error: 'No messages in conversation' }, { status: 404 });

  const { reply, intent, sentiment, confidence, tokensUsed } = await generateSuggestion({
    messages: messages.reverse(),
    contactName: conv?.name || 'Customer',
  });

  // Persist the suggestion
  const suggestion = await queryOne(
    `INSERT INTO ai_suggestions (conversation_id, suggested_reply, intent, sentiment, confidence, tokens_used)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [conversationId, reply, intent, sentiment, confidence, tokensUsed]
  );

  return NextResponse.json({ suggestion });
}

/** PUT /api/ai/suggest — Approve, edit, or reject a suggestion */
export async function PUT(request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, action, editedReply } = await request.json(); // action: approved|edited|rejected

  if (!['approved', 'edited', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const updated = await queryOne(
    `UPDATE ai_suggestions SET status = $1, edited_reply = $2, approved_by = 'admin' WHERE id = $3 RETURNING *`,
    [action, editedReply || null, id]
  );

  await queryOne(
    `INSERT INTO analytics_events (event_type, conversation_id) VALUES ($1, $2)`,
    [`ai_${action}`, updated?.conversation_id]
  );

  return NextResponse.json({ suggestion: updated });
}
