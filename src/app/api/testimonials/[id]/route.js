import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';
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
    const t = await Testimonial.findByIdAndUpdate(params.id, data, { new: true });
    if (!t) return NextResponse.json({ error: 'Not found' }, { status: 404 });    revalidatePath('/');
    revalidatePath('/testimonials');    return NextResponse.json({ testimonial: t });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    await Testimonial.findByIdAndDelete(params.id);
    revalidatePath('/');
    revalidatePath('/testimonials');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
