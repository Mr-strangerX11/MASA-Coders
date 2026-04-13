import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function isAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({
      $or: [{ slug: params.id }, { _id: params.id.length === 24 ? params.id : null }],
    });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!isAdmin() && post.status !== 'published') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    // Increment views
    if (post.status === 'published') {
      await BlogPost.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    }
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const data = await request.json();
    if (data.status === 'published' && !data.publishedAt) data.publishedAt = new Date();
    const post = await BlogPost.findByIdAndUpdate(params.id, data, { new: true });
    revalidatePath('/blog');
    revalidatePath(`/blog/${post?.slug || params.id}`);
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    await BlogPost.findByIdAndDelete(params.id);
    revalidatePath('/blog');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
