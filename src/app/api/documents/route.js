export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import { requireAnyAuth, requireAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId') || null;
    const search   = searchParams.get('search');
    const category = searchParams.get('category');
    const type     = searchParams.get('type');

    const filter = { parentId, isArchived: false };

    // Access control
    if (decoded.role === 'client') {
      filter.$or = [
        { access: 'all_clients' },
        { access: 'client_specific', allowedUserIds: decoded.id },
        { access: 'client_specific', clientId: decoded.id },
      ];
    } else if (decoded.role === 'staff') {
      filter.$or = [
        { access: { $in: ['staff', 'all_clients', 'public'] } },
        { uploadedBy: decoded.id },
      ];
    }

    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]});
    }
    if (category) filter.category = category;
    if (type)     filter.type = type;

    const docs = await Document.find(filter)
      .populate('uploadedBy', 'name email avatar')
      .sort({ isPinned: -1, type: -1, name: 1 })
      .lean();

    return NextResponse.json({ documents: docs });
  } catch (err) {
    console.error('GET /api/documents:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { name, type, parentId, url, publicId, mimeType, extension, size, category, tags, access, projectId, clientId } = body;

    if (!name) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (type === 'file' && !url) return NextResponse.json({ error: 'URL is required for files.' }, { status: 400 });

    const doc = await Document.create({
      name, type: type || 'file', parentId: parentId || null,
      url: url || '', publicId: publicId || '', mimeType: mimeType || '',
      extension: extension || '', size: size || 0,
      category: category || 'other', tags: tags || [],
      uploadedBy: decoded.id,
      access: access || (decoded.role === 'admin' ? 'admin_only' : 'private'),
      projectId, clientId,
    });

    return NextResponse.json({ document: doc }, { status: 201 });
  } catch (err) {
    console.error('POST /api/documents:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
