/**
 * Facebook Messenger + Instagram Messaging API client
 * Both use the same Graph API surface — differentiated by PSID source.
 */

const BASE_URL = 'https://graph.facebook.com/v19.0';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization:  `Bearer ${process.env.META_PAGE_ACCESS_TOKEN}`,
  };
}

export async function sendMessengerMessage(recipientId, text) {
  const res = await fetch(`${BASE_URL}/me/messages`, {
    method:  'POST',
    headers: headers(),
    body: JSON.stringify({
      recipient: { id: recipientId },
      message:   { text },
      messaging_type: 'RESPONSE',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Messenger send failed: ${JSON.stringify(err)}`);
  }
  return res.json();
}

/** Instagram uses the same endpoint — just different access token scope */
export const sendInstagramMessage = sendMessengerMessage;

/**
 * Parse a Messenger/Instagram webhook payload into a normalised inbound object.
 */
export function parseMessengerWebhook(body, platform = 'messenger') {
  try {
    const entry     = body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    if (!messaging?.message) return null;

    const { sender, message } = messaging;
    return {
      platform,
      platformUserId: sender.id,
      platformMsgId:  message.mid,
      senderName:     null, // Must call Graph API to get name — done async
      content:        message.text || `[${message.attachments?.[0]?.type || 'attachment'}]`,
      contentType:    message.attachments?.length ? message.attachments[0].type : 'text',
      mediaUrl:       message.attachments?.[0]?.payload?.url || null,
      timestamp:      messaging.timestamp,
      metadata:       { raw: messaging },
    };
  } catch {
    return null;
  }
}

/** Fetch the display name from Graph API (called async, not blocking the webhook) */
export async function resolveMessengerName(psid) {
  try {
    const res = await fetch(
      `${BASE_URL}/${psid}?fields=name&access_token=${process.env.META_PAGE_ACCESS_TOKEN}`
    );
    const data = await res.json();
    return data.name || null;
  } catch {
    return null;
  }
}
