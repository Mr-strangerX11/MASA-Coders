/**
 * Message queue — BullMQ-backed when REDIS_URL is set, no-op stub otherwise.
 * Webhook routes call enqueueInbound to hand off processing without blocking
 * the <200ms Meta webhook response window.
 */

let inboundQueue  = null;
let outboundQueue = null;

function getQueues() {
  if (!process.env.REDIS_URL) return { inbound: null, outbound: null };
  if (inboundQueue) return { inbound: inboundQueue, outbound: outboundQueue };

  try {
    const { Queue } = require('bullmq');
    const connection = { url: process.env.REDIS_URL, maxRetriesPerRequest: null };
    inboundQueue  = new Queue('inbound-messages',  { connection });
    outboundQueue = new Queue('outbound-messages', { connection });
    return { inbound: inboundQueue, outbound: outboundQueue };
  } catch (err) {
    console.warn('[queue] BullMQ unavailable:', err.message);
    return { inbound: null, outbound: null };
  }
}

export async function enqueueInbound(payload) {
  const { inbound } = getQueues();
  if (!inbound) {
    console.log('[queue] No Redis — inbound message dropped. Set REDIS_URL to enable.');
    return;
  }
  await inbound.add('process', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}

export async function enqueueOutbound(payload) {
  const { outbound } = getQueues();
  if (!outbound) {
    console.log('[queue] No Redis — outbound message dropped. Set REDIS_URL to enable.');
    return;
  }
  await outbound.add('send', payload, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } });
}
