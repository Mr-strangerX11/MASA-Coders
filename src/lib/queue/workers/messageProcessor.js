/**
 * BullMQ workers — run as a standalone process:
 *   node src/lib/queue/workers/messageProcessor.js
 *
 * Handles:
 *  - inbound-messages  → persist + create/update conversation + trigger AI
 *  - ai-processing     → generate suggestion → maybe auto-send
 *  - outbound-messages → send via channel API
 */
import 'dotenv/config';
import { Worker } from 'bullmq';
import { queryOne, queryRows, transaction } from '../../db/postgres.js';
import { enqueueAI, enqueueOutbound } from '../index.js';
import { generateSuggestion } from '../../ai/engine.js';
import { sendMessage } from '../../channels/index.js';
import { publish } from '../../db/redis.js';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// ── 1. Inbound message worker ────────────────────────────────
const inboundWorker = new Worker('inbound-messages', async (job) => {
  const { platform, platformUserId, platformMsgId, content, contentType = 'text', mediaUrl, senderName, metadata = {} } = job.data;

  await transaction(async (client) => {
    // Upsert contact
    let contact = await client.query(
      `SELECT c.id FROM contacts c
       JOIN platform_profiles pp ON pp.contact_id = c.id
       WHERE pp.platform = $1 AND pp.platform_user_id = $2`,
      [platform, platformUserId]
    );

    let contactId;
    if (!contact.rows[0]) {
      const c = await client.query(
        `INSERT INTO contacts (name) VALUES ($1) RETURNING id`,
        [senderName || 'Unknown']
      );
      contactId = c.rows[0].id;
      await client.query(
        `INSERT INTO platform_profiles (contact_id, platform, platform_user_id, platform_username)
         VALUES ($1, $2, $3, $4)`,
        [contactId, platform, platformUserId, senderName]
      );
    } else {
      contactId = contact.rows[0].id;
      // Update name if we now know it
      if (senderName) {
        await client.query(`UPDATE contacts SET name = $1, updated_at = NOW() WHERE id = $2 AND (name IS NULL OR name = 'Unknown')`, [senderName, contactId]);
      }
    }

    // Upsert conversation
    let conv = await client.query(
      `SELECT id, ai_mode, status FROM conversations
       WHERE platform = $1 AND platform_conversation_id = $2`,
      [platform, platformUserId]
    );

    let conversationId, aiMode;
    if (!conv.rows[0]) {
      const c = await client.query(
        `INSERT INTO conversations
           (contact_id, platform, platform_conversation_id, status, ai_mode, last_message_at, last_message_preview, unread_count)
         VALUES ($1,$2,$3,'new','manual',NOW(),$4,1) RETURNING id, ai_mode`,
        [contactId, platform, platformUserId, content.slice(0, 100)]
      );
      conversationId = c.rows[0].id;
      aiMode         = c.rows[0].ai_mode;
    } else {
      conversationId = conv.rows[0].id;
      aiMode         = conv.rows[0].ai_mode;
      await client.query(
        `UPDATE conversations
         SET last_message_at = NOW(), last_message_preview = $1,
             unread_count = unread_count + 1, status = CASE WHEN status = 'resolved' THEN 'active' ELSE status END,
             updated_at = NOW()
         WHERE id = $2`,
        [content.slice(0, 100), conversationId]
      );
    }

    // Persist message
    const msg = await client.query(
      `INSERT INTO messages (conversation_id, platform_message_id, direction, sender_type, sender_id, content, content_type, media_url, metadata)
       VALUES ($1,$2,'inbound','customer',$3,$4,$5,$6,$7) RETURNING id`,
      [conversationId, platformMsgId, platformUserId, content, contentType, mediaUrl, JSON.stringify(metadata)]
    );
    const messageId = msg.rows[0].id;

    // Analytics
    await client.query(
      `INSERT INTO analytics_events (event_type, conversation_id, message_id, platform) VALUES ('msg_received',$1,$2,$3)`,
      [conversationId, messageId, platform]
    );

    // Auto-create lead if new conversation
    const existing = await client.query(`SELECT id FROM leads WHERE conversation_id = $1`, [conversationId]);
    if (!existing.rows[0]) {
      await client.query(
        `INSERT INTO leads (contact_id, conversation_id, status, source_platform, assigned_to)
         VALUES ($1,$2,'new',$3,NULL)`,
        [contactId, conversationId, platform]
      );
    }

    // Publish real-time event
    await publish('inbox:new_message', { conversationId, messageId, platform, content: content.slice(0, 100), senderName });

    // Enqueue AI processing
    await enqueueAI(conversationId, messageId, aiMode);
  });
}, { connection, concurrency: 5 });

// ── 2. AI processing worker ──────────────────────────────────
const aiWorker = new Worker('ai-processing', async (job) => {
  const { conversationId, messageId, mode } = job.data;

  // Fetch last N messages for context
  const messages = await queryRows(
    `SELECT direction, sender_type, content FROM messages
     WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [conversationId]
  );
  messages.reverse();

  const conv = await queryOne(
    `SELECT c.name FROM conversations cv JOIN contacts c ON c.id = cv.contact_id WHERE cv.id = $1`,
    [conversationId]
  );

  const { reply, intent, sentiment, confidence, tokensUsed } = await generateSuggestion({
    messages,
    contactName: conv?.name || 'Customer',
  });

  // Store suggestion
  const suggestion = await queryOne(
    `INSERT INTO ai_suggestions (conversation_id, trigger_msg_id, suggested_reply, intent, sentiment, confidence, tokens_used)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [conversationId, messageId, reply, intent, sentiment, confidence, tokensUsed]
  );

  // Update conversation intent/sentiment
  await queryOne(
    `UPDATE conversations SET intent = $1, sentiment = $2, updated_at = NOW() WHERE id = $3`,
    [intent, sentiment, conversationId]
  );

  // Publish suggestion to UI
  await publish('inbox:ai_suggestion', { conversationId, suggestionId: suggestion.id, reply, intent, sentiment, confidence });

  // Full-auto mode → send immediately
  if (mode === 'full_auto') {
    await queryOne(`UPDATE ai_suggestions SET status = 'auto_sent' WHERE id = $1`, [suggestion.id]);

    const platformProfile = await queryOne(
      `SELECT pp.platform, pp.platform_user_id FROM conversations cv
       JOIN platform_profiles pp ON pp.contact_id = cv.contact_id AND pp.platform = cv.platform
       WHERE cv.id = $1`,
      [conversationId]
    );
    if (platformProfile) {
      await enqueueOutbound(platformProfile.platform, platformProfile.platform_user_id, reply, conversationId);
    }
  }
}, { connection, concurrency: 3 });

// ── 3. Outbound message worker ───────────────────────────────
const outboundWorker = new Worker('outbound-messages', async (job) => {
  const { platform, recipientId, message, conversationId } = job.data;

  await sendMessage(platform, recipientId, message);

  // Persist outbound message
  await queryOne(
    `INSERT INTO messages (conversation_id, direction, sender_type, content, ai_suggested, status)
     VALUES ($1,'outbound','ai',$2,true,'sent')`,
    [conversationId, message]
  );

  await publish('inbox:message_sent', { conversationId, message });
}, { connection, concurrency: 5 });

// ── Worker error handlers ────────────────────────────────────
[inboundWorker, aiWorker, outboundWorker].forEach((w) => {
  w.on('failed', (job, err) => console.error(`[Worker:${w.name}] job ${job?.id} failed:`, err.message));
  w.on('completed', (job) => console.log(`[Worker:${w.name}] job ${job.id} done`));
});

console.log('🚀 BullMQ workers running (inbound / ai / outbound)');

process.on('SIGTERM', async () => {
  await Promise.all([inboundWorker.close(), aiWorker.close(), outboundWorker.close()]);
  process.exit(0);
});
