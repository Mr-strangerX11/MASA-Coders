import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

function isAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  return !!verifyToken(token);
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const project = await Project.findOne({
      $or: [{ _id: params.id.length === 24 ? params.id : null }, { slug: params.id }],
    });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Public access only to published/featured
    if (!isAdmin() && !['published', 'featured'].includes(project.status)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const data = await request.json();
    const project = await Project.findByIdAndUpdate(params.id, data, { new: true, runValidators: true });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath(`/projects/${params.id}`);
    return NextResponse.json({ project });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const project = await Project.findByIdAndDelete(params.id);
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    revalidatePath('/');
    revalidatePath('/projects');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
