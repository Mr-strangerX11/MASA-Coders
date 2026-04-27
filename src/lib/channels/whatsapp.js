/**
 * WhatsApp Cloud API client
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */

const BASE_URL = 'https://graph.facebook.com/v19.0';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${process.env.WHATSAPP_TOKEN}`,
  };
}

/**
 * Send a plain text message via WhatsApp Cloud API.
 */
export async function sendWhatsAppMessage(to, text) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method:  'POST',
    headers: headers(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type:    'individual',
      to,
      type:    'text',
      text:    { preview_url: false, body: text },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`WhatsApp send failed: ${JSON.stringify(err)}`);
  }
  return res.json();
}

/**
 * Send a template message (for first-contact within 24h window).
 */
export async function sendWhatsAppTemplate(to, templateName, langCode = 'en_US', components = []) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method:  'POST',
    headers: headers(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: templateName, language: { code: langCode }, components },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`WhatsApp template failed: ${JSON.stringify(err)}`);
  }
  return res.json();
}

/**
 * Mark a message as read.
 */
export async function markAsRead(messageId) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method:  'POST',
    headers: headers(),
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status:   'read',
      message_id: messageId,
    }),
  });
}

/**
 * Parse a WhatsApp webhook entry into a normalised inbound payload.
 * Returns null if the entry has no customer message.
 */
export function parseWhatsAppWebhook(body) {
  try {
    const entry   = body.entry?.[0];
    const change  = entry?.changes?.[0];
    const value   = change?.value;
    const msg     = value?.messages?.[0];
    if (!msg) return null;

    const contact = value.contacts?.[0];
    return {
      platform:       'whatsapp',
      platformUserId: msg.from,
      platformMsgId:  msg.id,
      senderName:     contact?.profile?.name || msg.from,
      content:        msg.text?.body || msg.caption || `[${msg.type}]`,
      contentType:    msg.type === 'text' ? 'text' : msg.type,
      mediaUrl:       msg.image?.id || msg.document?.id || null,
      timestamp:      msg.timestamp,
      metadata:       { raw: msg },
    };
  } catch {
    return null;
  }
}
