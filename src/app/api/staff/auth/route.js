export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, setAuthCookie, requireStaff } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/apiHelpers';

// POST /api/staff/auth?action=login|logout
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete('staff_token');
    res.cookies.delete('admin_token');
    return res;
  }

  if (action === 'login') {
    try {
      const ip = getClientIp(request);
      const limited = await rateLimit(`staff-login:${ip}`, 10, 900);
      if (!limited.ok) return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });

      const { email, password } = await request.json();
      if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase(), role: { $in: ['staff', 'manager', 'editor', 'admin'] } }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
      }
      if (!user.isActive) return NextResponse.json({ error: 'Account deactivated. Contact admin.' }, { status: 403 });

      user.lastLoginAt = new Date();
      await user.save();

      const token = signToken({ id: user._id, role: user.role, email: user.email });
      setAuthCookie(token, user.role); // admin/editor/manager → admin_token, staff → staff_token

      return NextResponse.json({ ok: true, user: user.toJSON() });
    } catch (err) {
      console.error('Staff auth error:', err);
      return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
}

// GET /api/staff/auth — get current staff session
export async function GET(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    return NextResponse.json({ user: user.toJSON() });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
