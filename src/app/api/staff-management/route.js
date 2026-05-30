export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { emailWelcomeStaff } from '@/lib/sendPlatformEmail';

export async function GET(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const search     = searchParams.get('search');
    const role       = searchParams.get('role');

    const filter = { role: { $in: ['staff', 'manager', 'editor'] } };
    if (department) filter.department = department;
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const staff = await User.find(filter).sort({ name: 1 }).lean();
    return NextResponse.json({ staff });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { name, email, password, role, department, jobTitle, phone, salary, skills, joiningDate } = body;

    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    if (!['staff', 'manager', 'editor'].includes(role)) return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });

    const employeeId = `EMP-${String(Date.now()).slice(-6)}`;

    const user = await User.create({
      name, email, password, role,
      department: department || '',
      jobTitle: jobTitle || '',
      phone: phone || '',
      salary: salary || 0,
      skills: skills || [],
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      employeeId,
      isActive: true,
      isVerified: true,
    });

    // Send welcome email with temp password (password is hashed, so send original)
    emailWelcomeStaff(user.toJSON(), password).catch(() => {});

    return NextResponse.json({ user: user.toJSON() }, { status: 201 });
  } catch (err) {
    console.error('POST /api/staff-management:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
