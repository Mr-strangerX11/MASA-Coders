import { NextResponse } from 'next/server';

const ADMIN_ROLES  = ['admin', 'editor', 'manager'];
const STAFF_ROLES  = ['admin', 'editor', 'manager', 'staff'];
const CLIENT_ROLES = ['admin', 'editor', 'manager', 'client'];

async function verifyToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || !token) return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const sigBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));
    const dataBytes = encoder.encode(`${header}.${payload}`);

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!valid) return null;

    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (decoded.exp && Date.now() / 1000 > decoded.exp) return null;

    return decoded;
  } catch {
    return null;
  }
}

async function getUser(request, cookieName) {
  const token = request.cookies.get(cookieName)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Admin portal ──────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const publicPaths = ['/admin/login', '/admin/forgot-password'];
    if (publicPaths.includes(pathname)) {
      const user = await getUser(request, 'admin_token');
      if (user && ADMIN_ROLES.includes(user.role)) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }
    const user = await getUser(request, 'admin_token');
    if (!user || !ADMIN_ROLES.includes(user.role)) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Staff portal ──────────────────────────────────────────
  if (pathname.startsWith('/staff')) {
    const publicPaths = ['/staff/login'];
    if (publicPaths.includes(pathname)) {
      const user = await getUser(request, 'staff_token');
      if (user && STAFF_ROLES.includes(user.role)) {
        return NextResponse.redirect(new URL('/staff/dashboard', request.url));
      }
      return NextResponse.next();
    }
    const user = await getUser(request, 'staff_token');
    if (!user || !STAFF_ROLES.includes(user.role)) {
      const url = new URL('/staff/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── Client portal ─────────────────────────────────────────
  if (pathname.startsWith('/client')) {
    const publicPaths = ['/client/login', '/client/register'];
    if (publicPaths.includes(pathname)) {
      const user = await getUser(request, 'client_token');
      if (user && CLIENT_ROLES.includes(user.role)) {
        return NextResponse.redirect(new URL('/client/dashboard', request.url));
      }
      return NextResponse.next();
    }
    const user = await getUser(request, 'client_token');
    if (!user || !CLIENT_ROLES.includes(user.role)) {
      const url = new URL('/client/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/staff/:path*', '/client/:path*'],
};
