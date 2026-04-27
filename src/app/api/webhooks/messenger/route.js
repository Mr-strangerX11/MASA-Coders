import { NextResponse } from 'next/server';
import { verifyMetaSignature, verifyMetaChallenge } from '@/lib/webhooks/verifier';
import { parseMessengerWebhook } from '@/lib/channels/messenger';
import { enqueueInbound } from '@/lib/queue/index';
import { rateLimit } from '@/lib/rateLimit';

/** GET — Meta webhook subscription verification (shared for Messenger + Instagram) */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challenge = verifyMetaChallenge(searchParams);
  if (challenge) return new Response(challenge, { status: 200 });
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/** POST — Incoming Messenger or Instagram messages */
export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const { allowed } = rateLimit(`wh:meta:${ip}`, { limit: 100, windowMs: 60_000 });
  if (!allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  const rawBody  = await request.text();
  const signature = request.headers.get('x-hub-signature-256') || '';

  if (!verifyMetaSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body;
  try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  // Differentiate Messenger vs Instagram by object type
  const platform = body.object === 'instagram' ? 'instagram' : 'messenger';

  if (!['page', 'instagram'].includes(body.object)) {
    return NextResponse.json({ status: 'ignored' });
  }

  const payload = parseMessengerWebhook(body, platform);
  if (payload) await enqueueInbound(payload);

  return NextResponse.json({ status: 'ok' });
}
