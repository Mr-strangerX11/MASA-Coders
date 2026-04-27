import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { queryRows, queryOne } from '@/lib/db/postgres';

function isAdmin() {
  const token = cookies().get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

/** GET /api/analytics/inbox?days=7 */
export async function GET(request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const days = Math.min(90, parseInt(searchParams.get('days') || '7'));
  const since = `NOW() - INTERVAL '${days} days'`;

  const [
    msgsByPlatform,
    msgsByDay,
    intentBreakdown,
    sentimentBreakdown,
    responseStats,
    leadsByStatus,
    aiStats,
  ] = await Promise.all([
    // Messages per platform
    queryRows(
      `SELECT cv.platform, COUNT(*) as total, COUNT(*) FILTER (WHERE m.direction='inbound') as inbound,
              COUNT(*) FILTER (WHERE m.direction='outbound') as outbound
       FROM messages m JOIN conversations cv ON cv.id = m.conversation_id
       WHERE m.created_at > ${since} GROUP BY cv.platform ORDER BY total DESC`
    ),

    // Messages per day
    queryRows(
      `SELECT DATE(m.created_at) as day, COUNT(*) as total
       FROM messages m WHERE m.created_at > ${since}
       GROUP BY day ORDER BY day ASC`
    ),

    // Intent breakdown
    queryRows(
      `SELECT intent, COUNT(*) as count FROM conversations
       WHERE intent IS NOT NULL AND created_at > ${since}
       GROUP BY intent ORDER BY count DESC`
    ),

    // Sentiment breakdown
    queryRows(
      `SELECT sentiment, COUNT(*) as count FROM conversations
       WHERE sentiment IS NOT NULL AND created_at > ${since}
       GROUP BY sentiment`
    ),

    // Avg response time (inbound → next outbound in same conversation)
    queryOne(
      `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (o.created_at - i.created_at))/60)::numeric, 1) as avg_minutes
       FROM messages i
       JOIN LATERAL (
         SELECT created_at FROM messages
         WHERE conversation_id = i.conversation_id AND direction = 'outbound' AND created_at > i.created_at
         ORDER BY created_at ASC LIMIT 1
       ) o ON true
       WHERE i.direction = 'inbound' AND i.created_at > ${since}`
    ),

    // Leads by status
    queryRows(
      `SELECT status, COUNT(*) as count FROM leads WHERE created_at > ${since} GROUP BY status`
    ),

    // AI suggestion stats
    queryOne(
      `SELECT
         COUNT(*) as total,
         COUNT(*) FILTER (WHERE status = 'approved') as approved,
         COUNT(*) FILTER (WHERE status = 'edited')   as edited,
         COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
         COUNT(*) FILTER (WHERE status = 'auto_sent') as auto_sent,
         ROUND(AVG(confidence)::numeric, 2) as avg_confidence
       FROM ai_suggestions WHERE created_at > ${since}`
    ),
  ]);

  return NextResponse.json({
    period:     { days },
    msgsByPlatform,
    msgsByDay,
    intentBreakdown,
    sentimentBreakdown,
    avgResponseMinutes: parseFloat(responseStats?.avg_minutes || 0),
    leadsByStatus,
    aiStats,
  });
}
