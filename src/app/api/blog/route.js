import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const skip = (page - 1) * limit;

    const query = (admin && isAdmin()) ? {} : { status: 'published' };
    const [posts, total] = await Promise.all([
      BlogPost.find(query).sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
      BlogPost.countDocuments(query),
    ]);

    return NextResponse.json({ posts, total, pages: Math.ceil(total / limit) });
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
    if (data.status === 'published' && !data.publishedAt) data.publishedAt = new Date();
    const post = await BlogPost.create(data);
    revalidatePath('/blog');
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
