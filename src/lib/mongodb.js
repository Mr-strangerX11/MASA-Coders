import mongoose from 'mongoose';
import { logger } from './logger.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error('MONGODB_URI environment variable is not set');

// Module-level singleton — persists across hot-reloads in dev via global
const cache = global._mongoose ?? (global._mongoose = { conn: null, promise: null });

const OPTS = {
  bufferCommands:           false,   // fail fast instead of queuing when disconnected
  maxPoolSize:              20,
  minPoolSize:              2,       // keep warm connections ready
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS:          45_000,
  heartbeatFrequencyMS:     10_000,  // detect stale connections every 10s
  connectTimeoutMS:         10_000,
};

export default async function connectDB() {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    logger.info('[mongodb] Connecting…');
    cache.promise = mongoose.connect(MONGODB_URI, OPTS).then(m => {
      logger.info('[mongodb] Connected');

      m.connection.on('disconnected', () => {
        logger.warn('[mongodb] Disconnected — reconnecting on next request');
        cache.conn    = null;
        cache.promise = null;
      });
      m.connection.on('error', (err) => {
        logger.error('[mongodb] Connection error', { error: err.message });
        cache.conn    = null;
        cache.promise = null;
      });

      return m;
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null; // allow clean retry on next request
    logger.error('[mongodb] Failed to connect', { error: err.message });
    throw err;
  }

  return cache.conn;
}
