import { sendWhatsAppMessage } from './whatsapp.js';
import { sendMessengerMessage, sendInstagramMessage } from './messenger.js';

/**
 * Unified send — routes to the correct channel client.
 */
export async function sendMessage(platform, recipientId, text) {
  switch (platform) {
    case 'whatsapp':
      return sendWhatsAppMessage(recipientId, text);
    case 'messenger':
      return sendMessengerMessage(recipientId, text);
    case 'instagram':
      return sendInstagramMessage(recipientId, text);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export const PLATFORM_LABELS = {
  whatsapp:  'WhatsApp',
  messenger: 'Messenger',
  instagram: 'Instagram',
  livechat:  'Live Chat',
  email:     'Email',
};

export const SUPPORTED_PLATFORMS = Object.keys(PLATFORM_LABELS);
