import { Server } from 'socket.io';
import { getRedis, getSubscriber } from '@/lib/db/redis';

let io;

/**
 * Attach Socket.IO to an existing HTTP server.
 * Called once from server.js at startup.
 */
export function initSocketServer(httpServer) {
  if (io) return io;

  io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin:      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware ──────────────────────────────────────────
  io.use((socket, next) => {
    // Simple token check — replace with real JWT validation in production
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token && process.env.NODE_ENV === 'production') {
      return next(new Error('Unauthorized'));
    }
    next();
  });

  // ── Connection handler ───────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`[Socket] client connected: ${socket.id}`);

    // Agent joins their personal room + global inbox room
    socket.join('inbox');

    socket.on('join_conversation', (conversationId) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
    });

    // Typing indicator relay
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit('peer_typing', { conversationId, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] client disconnected: ${socket.id}`);
    });
  });

  // ── Redis Pub/Sub bridge ─────────────────────────────────────
  // Workers publish events → Redis → Socket.IO forwards to clients
  const sub = getSubscriber();
  const channels = [
    'inbox:new_message',
    'inbox:ai_suggestion',
    'inbox:message_sent',
    'inbox:conv_updated',
  ];

  sub.subscribe(...channels, (err) => {
    if (err) console.error('[Socket] Redis subscribe error:', err.message);
    else console.log('[Socket] Subscribed to Redis channels:', channels.join(', '));
  });

  sub.on('message', (channel, message) => {
    try {
      const data = JSON.parse(message);
      switch (channel) {
        case 'inbox:new_message':
          io.to('inbox').emit('new_message', data);
          io.to(`conv:${data.conversationId}`).emit('message', data);
          break;
        case 'inbox:ai_suggestion':
          io.to(`conv:${data.conversationId}`).emit('ai_suggestion', data);
          break;
        case 'inbox:message_sent':
          io.to(`conv:${data.conversationId}`).emit('message', data);
          io.to('inbox').emit('conv_updated', { conversationId: data.conversationId });
          break;
        case 'inbox:conv_updated':
          io.to('inbox').emit('conv_updated', data);
          io.to(`conv:${data.conversationId}`).emit('conv_updated', data);
          break;
      }
    } catch (err) {
      console.error('[Socket] message parse error:', err.message);
    }
  });

  return io;
}

export function getIO() {
  return io;
}
