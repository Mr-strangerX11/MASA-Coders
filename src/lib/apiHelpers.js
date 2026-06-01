import { NextResponse } from 'next/server';

// ── Safe IP extraction ────────────────────────────────────────────────────────
// x-forwarded-for can be a comma-list; take only the first (leftmost) hop.
export function getClientIp(request) {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

// ── Consistent error responses ────────────────────────────────────────────────
// In production, never leak stack traces or internal messages to clients.
export function apiError(message, status = 500) {
  const isInternal = status >= 500;
  return NextResponse.json(
    { error: isInternal && process.env.NODE_ENV === 'production' ? 'Internal server error.' : message },
    { status }
  );
}

// ── Input sanitization ────────────────────────────────────────────────────────
// Strip MongoDB operator keys ($, .) from user-supplied objects (NoSQL injection guard).
export function sanitize(value) {
  if (typeof value === 'string') {
    return value.replace(/[\$\.]/g, '').trim();
  }
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !k.startsWith('$') && !k.includes('.'))
        .map(([k, v]) => [k, sanitize(v)])
    );
  }
  return value;
}

// ── Pagination helper ─────────────────────────────────────────────────────────
export function getPagination(searchParams, defaultLimit = 20, maxLimit = 100) {
  const page  = Math.max(1, parseInt(searchParams.get('page')  || '1'));
  const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit))));
  return { page, limit, skip: (page - 1) * limit };
}
