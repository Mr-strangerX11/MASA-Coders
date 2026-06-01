export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/users — list users (role, status, search, pagination)
export async function GET(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const role     = searchParams.get('role')   || '';
    const status   = searchParams.get('status') || 'all'; // all | pending | active | inactive
    const search   = searchParams.get('search') || '';
    const page     = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit    = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const query = {};
    if (role) query.role = role;

    if (status === 'pending')  { query.isVerified = false; query.isActive = true; }
    if (status === 'active')   { query.isVerified = true;  query.isActive = true; }
    if (status === 'inactive') { query.isActive = false; }

    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [{ name: re }, { email: re }, { company: re }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -resetPasswordToken -otp -otpExpiry -bankDetails')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/admin/users — update a user (isVerified, isActive, role)
export async function PATCH(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { userId, updates } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId required.' }, { status: 400 });

    const allowed = ['isVerified', 'isActive', 'role'];
    const safeUpdates = Object.fromEntries(
      Object.entries(updates || {}).filter(([k]) => allowed.includes(k))
    );
    if (!Object.keys(safeUpdates).length) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(userId, safeUpdates, { new: true })
      .select('-password -resetPasswordToken -otp -otpExpiry -bankDetails');
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('Admin users PATCH error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// DELETE /api/admin/users — hard delete or soft deactivate
// ?userId=xxx&hard=true  → permanently delete
// ?userId=xxx            → deactivate only
export async function DELETE(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const hard   = searchParams.get('hard') === 'true';
    if (!userId) return NextResponse.json({ error: 'userId required.' }, { status: 400 });

    // Prevent deleting own account
    if (userId === decoded.id) {
      return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    if (hard) {
      const user = await User.findByIdAndDelete(userId);
      if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
      return NextResponse.json({ ok: true, deleted: true });
    }

    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true })
      .select('-password -resetPasswordToken -otp -otpExpiry');
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('Admin users DELETE error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
