import { NextResponse } from 'next/server';

// Edge-compatible JWT verification using Web Crypto API
async function verifyAdminToken(token) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || !token) return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [header, payload, signature] = parts;

    // Verify signature using HMAC-SHA256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert base64url signature to ArrayBuffer
    const base64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const sigBytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));

    const dataBytes = encoder.encode(`${header}.${payload}`);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!valid) return false;

    // Check expiry
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (decoded.exp && Date.now() / 1000 > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow the login page through without auth
  if (pathname === '/admin/login') {
    // If already logged in, redirect to dashboard
    const token = request.cookies.get('admin_token')?.value;
    if (token && (await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other /admin/* routes
  const token = request.cookies.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
