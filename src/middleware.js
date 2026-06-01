import { NextResponse } from 'next/server';
import { ADMIN_ROLES, STAFF_ROLES, getCookieName } from '@/lib/roles';

// ── JWT verification (Web Crypto — no Node.js deps in Edge runtime) ──────────

async function verifyJwt(token) {
  if (!token) return null;
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const enc     = new TextEncoder();
    const key     = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const b64     = (s) => s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - s.length % 4) % 4, '=');
    const sigBuf  = Uint8Array.from(atob(b64(signature)), c => c.charCodeAt(0));
    const valid   = await crypto.subtle.verify('HMAC', key, sigBuf, enc.encode(`${header}.${payload}`));
    if (!valid) return null;

    const decoded = JSON.parse(atob(b64(payload)));
    if (decoded.exp && Date.now() / 1000 > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

function getToken(request, role) {
  return request.cookies.get(getCookieName(role))?.value ?? null;
}

// ── Portal guard factory ─────────────────────────────────────────────────────

function portalGuard(prefix, cookieRole, allowedRoles, loginPath, publicPaths = []) {
  return async (request) => {
    const { pathname } = request.nextUrl;

    const isPublic = publicPaths.includes(pathname);
    const token    = getToken(request, cookieRole);
    const user     = await verifyJwt(token); // single decode

    if (isPublic) {
      // Redirect already-authenticated users away from login pages
      if (user && allowedRoles.includes(user.role)) {
        return NextResponse.redirect(new URL(`${prefix}/dashboard`, request.url));
      }
      return NextResponse.next();
    }

    if (!user || !allowedRoles.includes(user.role)) {
      const url = new URL(loginPath, request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  };
}

const guards = {
  '/admin':  portalGuard('/admin',  'admin',  ADMIN_ROLES,   '/admin/login',  ['/admin/login', '/admin/forgot-password', '/admin/reset-password']),
  '/staff':  portalGuard('/staff',  'staff',  STAFF_ROLES,   '/staff/login',  ['/staff/login']),
  '/client': portalGuard('/client', 'client', ['client'],    '/client/login', ['/client/login', '/client/register']),
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  for (const [prefix, guard] of Object.entries(guards)) {
    if (pathname.startsWith(prefix)) return guard(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/client/:path*'],
};
