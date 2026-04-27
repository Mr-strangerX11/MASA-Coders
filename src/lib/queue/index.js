import { Queue, Worker, QueueEvents } from 'bullmq';
import { getRedis } from '@/lib/db/redis';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

// ── Queue definitions ────────────────────────────────────────
export const inboundQueue  = new Queue('inbound-messages',  { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } } });
export const aiQueue       = new Queue('ai-processing',     { connection, defaultJobOptions: { attempts: 2, backoff: { type: 'fixed', delay: 1000 } } });
export const outboundQueue = new Queue('outbound-messages', { connection, defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 1500 } } });

// ── Job creators ─────────────────────────────────────────────
export async function enqueueInbound(payload) {
  return inboundQueue.add('process', payload, { removeOnComplete: 100, removeOnFail: 50 });
}

export async function enqueueAI(conversationId, messageId, mode) {
  return aiQueue.add('suggest', { conversationId, messageId, mode }, { removeOnComplete: 100, removeOnFail: 50 });
}

export async function enqueueOutbound(platform, recipientId, message, conversationId) {
  return outboundQueue.add('send', { platform, recipientId, message, conversationId }, { removeOnComplete: 200, removeOnFail: 100 });
}

// ── Queue event monitors (for logging) ──────────────────────
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  const events = new QueueEvents('inbound-messages', { connection });
  events.on('failed', ({ jobId, failedReason }) =>
    console.error(`[Queue] inbound job ${jobId} failed: ${failedReason}`)
  );
}
