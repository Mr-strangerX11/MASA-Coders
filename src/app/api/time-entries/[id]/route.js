export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TimeEntry from '@/models/TimeEntry';
import { requireStaff } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const entry = await TimeEntry.findByIdAndUpdate(params.id, { $set: body }, { new: true })
      .populate('taskId', 'title').populate('projectId', 'title color');
    if (!entry) return NextResponse.json({ error: 'Entry not found.' }, { status: 404 });
    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await requireStaff(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    await TimeEntry.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
