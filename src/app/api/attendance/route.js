export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import { requireStaff, requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || decoded.id;
    const month  = searchParams.get('month'); // YYYY-MM
    const filter = {};

    // Staff can only see their own records
    if (decoded.role === 'staff') filter.userId = decoded.id;
    else if (userId) filter.userId = userId;

    if (month) {
      const [y, m] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(y, m - 1, 1),
        $lt:  new Date(y, m, 1),
      };
    }

    const records = await Attendance.find(filter)
      .populate('userId', 'name email avatar')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST — check in or mark attendance
export async function POST(request) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const userId = decoded.role === 'staff' ? decoded.id : (body.userId || decoded.id);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ userId, date: { $gte: today } });

    if (existing) {
      // Check-out
      const checkOut = new Date();
      const workHours = parseFloat(((checkOut - existing.checkIn) / 3600000).toFixed(2));
      const updated = await Attendance.findByIdAndUpdate(existing._id, { checkOut, workHours }, { new: true });
      return NextResponse.json({ record: updated, action: 'checkout' });
    } else {
      // Check-in
      const record = await Attendance.create({
        userId,
        date: today,
        checkIn: new Date(),
        status: body.status || 'present',
        notes: body.notes || '',
      });
      return NextResponse.json({ record, action: 'checkin' }, { status: 201 });
    }
  } catch (err) {
    console.error('POST /api/attendance:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
