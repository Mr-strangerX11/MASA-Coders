import { NextResponse } from 'next/server';
import { verifyMetaSignature, verifyMetaChallenge } from '@/lib/webhooks/verifier';
import { parseWhatsAppWebhook } from '@/lib/channels/whatsapp';
import { enqueueInbound } from '@/lib/queue/index';
import { rateLimit } from '@/lib/rateLimit';

/** GET — Meta webhook subscription verification */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challenge = verifyMetaChallenge(searchParams);
  if (challenge) return new Response(challenge, { status: 200 });
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/** POST — Incoming WhatsApp messages */
export async function POST(request) {
  // Rate limit by source IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const { allowed } = rateLimit(`wh:wa:${ip}`, { limit: 100, windowMs: 60_000 });
  if (!allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  // Read raw body for signature verification
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256') || '';

  if (!verifyMetaSignature(rawBody, signature)) {
    console.warn('[Webhook:WhatsApp] Invalid signature from', ip);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // WhatsApp sends status updates too — only process messages
  if (body.object !== 'whatsapp_business_account') {
    return NextResponse.json({ status: 'ignored' });
  }

  const payload = parseWhatsAppWebhook(body);
  if (payload) {
    // Enqueue for async processing — respond to Meta immediately (< 200ms)
    await enqueueInbound(payload);
  }

  // Meta requires HTTP 200 or it retries
  return NextResponse.json({ status: 'ok' });
}
