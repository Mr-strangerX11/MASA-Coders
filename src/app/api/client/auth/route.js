export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, setAuthCookie, requireClient } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

// POST /api/client/auth — login or register action via ?action=login|register|logout|me
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete('client_token');
    return res;
  }

  try {
    const body = await request.json();

    if (action === 'register') {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const limited = await rateLimit(`register:${ip}`, 5, 3600);
      if (!limited.ok) return NextResponse.json({ error: 'Too many registrations. Try again later.' }, { status: 429 });

      const { name, email, password, company, phone } = body;
      if (!name || !email || !password) return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
      if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

      await connectDB();
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });

      const user = await User.create({ name, email, password, company: company || '', phone: phone || '', role: 'client', isVerified: false });

      // No cookie yet — user must verify email via OTP first
      return NextResponse.json({ ok: true, requiresVerification: true, email: user.email }, { status: 201 });
    }

    if (action === 'login') {
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      const limited = await rateLimit(`login:${ip}`, 10, 900);
      if (!limited.ok) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });

      const { email, password } = body;
      if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase(), role: 'client' }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      if (!user.isActive) return NextResponse.json({ error: 'Your account has been deactivated. Contact support.' }, { status: 403 });

      // Unverified: if OTP exists → they're mid-registration, must verify.
      // If no OTP (pre-OTP-system account) → auto-verify on correct password.
      if (!user.isVerified) {
        if (user.otp) {
          return NextResponse.json({ error: 'Please verify your email first.', requiresVerification: true, email: user.email }, { status: 403 });
        }
        user.isVerified = true; // pre-existing account — password proves ownership
      }

      user.lastLoginAt = new Date();
      await user.save();

      const token = signToken({ id: user._id, role: 'client', email: user.email });
      setAuthCookie(token, 'client');

      return NextResponse.json({ ok: true, user: user.toJSON() });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('Client auth error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// GET /api/client/auth — get current client session
export async function GET(request) {
  try {
    const decoded = await requireClient(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    return NextResponse.json({ user: user.toJSON() });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
