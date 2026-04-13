import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function isAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

export async function PUT(request, { params }) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const data = await request.json();
    const inquiry = await Inquiry.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json({ inquiry });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    await Inquiry.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
