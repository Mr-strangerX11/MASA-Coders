import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { ADMIN_ROLES, STAFF_ROLES, ALL_ROLES, getCookieName } from '@/lib/roles';

const JWT_SECRET  = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');
const JWT_EXPIRES = '7d';

// ── Token helpers ─────────────────────────────────────────────────────────────

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function setAuthCookie(token, role = 'admin') {
  cookies().set(getCookieName(role), token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7, // 7 days
    path:     '/',
  });
}

export function clearAuthCookie(role = 'admin') {
  cookies().delete(getCookieName(role));
}

// ── Request authentication ────────────────────────────────────────────────────

function getTokenFromRequest(request, cookieName) {
  const bearer = request.headers.get('Authorization');
  if (bearer?.startsWith('Bearer ')) return bearer.slice(7);
  return request.cookies?.get?.(cookieName)?.value ?? cookies().get(cookieName)?.value ?? null;
}

export async function requireAuth(request, allowedRoles) {
  // Deduplicate cookie names — admin/editor/manager all share admin_token
  const seen = new Set();
  for (const role of allowedRoles) {
    const cookieName = getCookieName(role);
    if (seen.has(cookieName)) continue;
    seen.add(cookieName);

    const token   = getTokenFromRequest(request, cookieName);
    const decoded = verifyToken(token);
    if (decoded && allowedRoles.includes(decoded.role)) return decoded;
  }
  return null;
}

export const requireAdmin  = (req) => requireAuth(req, ADMIN_ROLES);
export const requireStaff  = (req) => requireAuth(req, STAFF_ROLES);
export const requireClient = (req) => requireAuth(req, [...ADMIN_ROLES, 'client']);
export const requireAnyAuth= (req) => requireAuth(req, ALL_ROLES);

// Re-export for consumers that import from auth.js
export { getCookieName, ADMIN_ROLES, STAFF_ROLES };
