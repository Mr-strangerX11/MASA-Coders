import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { slugify } from '@/lib/utils';

function isAdmin(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  return !!verifyToken(token);
}

// Public: GET published/featured projects
// Admin: GET all projects (with ?admin=true)
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    let query = {};

    if (admin && isAdmin(request)) {
      if (status) query.status = status;
    } else {
      // Public: only show published or featured
      query.status = { $in: ['published', 'featured'] };
      if (featured) query.isFeatured = true;
    }

    const [projects, total] = await Promise.all([
      Project.find(query).sort({ isFeatured: -1, order: 1, createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(query),
    ]);

    return NextResponse.json({ projects, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Admin: Create project
export async function POST(request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const data = await request.json();
    if (!data.slug) data.slug = slugify(data.title);

    // Ensure unique slug
    let slug = data.slug;
    let count = 0;
    while (await Project.findOne({ slug })) {
      count++;
      slug = `${data.slug}-${count}`;
    }
    data.slug = slug;

    const project = await Project.create(data);
    revalidatePath('/');
    revalidatePath('/projects');
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
