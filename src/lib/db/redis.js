import Redis from 'ioredis';

let client;
let subscriber;

function createClient(name = 'default') {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const instance = new Redis(url, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 100, 3_000),
  });
  instance.on('error', (err) => console.error(`[Redis:${name}] ${err.message}`));
  instance.on('connect', () => console.log(`[Redis:${name}] connected`));
  return instance;
}

export function getRedis() {
  if (!client) client = createClient('main');
  return client;
}

/** Separate connection for Pub/Sub (subscribe blocks the connection) */
export function getSubscriber() {
  if (!subscriber) subscriber = createClient('sub');
  return subscriber;
}

/** Cache helpers */
export async function cacheGet(key) {
  const val = await getRedis().get(key);
  return val ? JSON.parse(val) : null;
}

export async function cacheSet(key, value, ttlSeconds = 300) {
  await getRedis().set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function cacheDel(key) {
  await getRedis().del(key);
}

/** Publish a Socket.IO-compatible event via Redis Pub/Sub */
export async function publish(channel, data) {
  await getRedis().publish(channel, JSON.stringify(data));
}
