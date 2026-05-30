import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');
const JWT_EXPIRES = '7d';

const ADMIN_ROLES = ['admin', 'editor', 'manager'];

const ROLE_COOKIE = {
  admin:   'admin_token',
  editor:  'admin_token',
  manager: 'admin_token',
  staff:   'staff_token',
  client:  'client_token',
};

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getCookieName(role) {
  return ROLE_COOKIE[role] || 'client_token';
}

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

export function setAuthCookie(token, role = 'admin') {
  const cookieStore = cookies();
  cookieStore.set(getCookieName(role), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export function clearAuthCookie(role = 'admin') {
  const cookieStore = cookies();
  cookieStore.delete(getCookieName(role));
}

export function getTokenFromRequest(request, cookieName = 'admin_token') {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  const cookieStore = cookies();
  return cookieStore.get(cookieName)?.value || null;
}

// Generic: requires one of the specified roles
export async function requireAuth(request, allowedRoles = ADMIN_ROLES) {
  const cookiesToTry = [...new Set(allowedRoles.map(r => getCookieName(r)))];
  for (const cookieName of cookiesToTry) {
    const token = getTokenFromRequest(request, cookieName);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && allowedRoles.includes(decoded.role)) return decoded;
    }
  }
  return null;
}

export async function requireAdmin(request) {
  return requireAuth(request, ADMIN_ROLES);
}

export async function requireStaff(request) {
  return requireAuth(request, [...ADMIN_ROLES, 'staff']);
}

export async function requireClient(request) {
  return requireAuth(request, [...ADMIN_ROLES, 'client']);
}

export async function requireAnyAuth(request) {
  return requireAuth(request, ['admin', 'editor', 'manager', 'staff', 'client']);
}
