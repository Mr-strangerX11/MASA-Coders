import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Offer from '@/models/Offer';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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
    const featured = searchParams.get('featured') === 'true';

    let query = {};
    const now = new Date();

    if (admin && isAdmin()) {
      // Admin sees all
    } else {
      // Public: active and not expired
      query = { isActive: true, startDate: { $lte: now }, endDate: { $gte: now } };
      if (featured) query.isFeatured = true;
    }

    const offers = await Offer.find(query).sort({ isFeatured: -1, order: 1, createdAt: -1 });
    return NextResponse.json({ offers });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const data = await request.json();
    const offer = await Offer.create(data);
    revalidatePath('/');
    revalidatePath('/offers');
    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
