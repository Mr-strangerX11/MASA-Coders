import crypto from 'crypto';

/**
 * Verify Meta (WhatsApp / Messenger / Instagram) webhook signature.
 * Meta sends: X-Hub-Signature-256: sha256=<hmac>
 */
export function verifyMetaSignature(rawBody, signatureHeader) {
  const secret = process.env.META_WEBHOOK_SECRET;
  if (!secret) throw new Error('META_WEBHOOK_SECRET not configured');

  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')}`;

  // Constant-time comparison to prevent timing attacks
  if (signatureHeader.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(signatureHeader),
    Buffer.from(expected)
  );
}

/**
 * Verify the Meta hub challenge for webhook subscription verification.
 */
export function verifyMetaChallenge(searchParams) {
  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  const expected  = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === expected) return challenge;
  return null;
}
