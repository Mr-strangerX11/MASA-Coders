import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';

function isAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';

    const query = (admin && isAdmin()) ? {} : { isVisible: true };
    const services = await Service.find(query).sort({ isFeatured: -1, order: 1 });
    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const data = await request.json();
    if (!data.slug) data.slug = slugify(data.title);
    const service = await Service.create(data);
    revalidatePath('/');
    revalidatePath('/services');
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
