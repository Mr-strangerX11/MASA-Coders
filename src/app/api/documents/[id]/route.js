export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Document from '@/models/Document';
import { requireAnyAuth, requireAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const doc = await Document.findById(params.id).populate('uploadedBy', 'name email avatar').lean();
    if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });

    // Increment download count on GET for files
    if (doc.type === 'file') {
      await Document.findByIdAndUpdate(params.id, { $inc: { downloadCount: 1 } });
    }

    return NextResponse.json({ document: doc });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const doc = await Document.findByIdAndUpdate(params.id, { $set: body }, { new: true })
      .populate('uploadedBy', 'name email avatar');

    if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    return NextResponse.json({ document: doc });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const doc = await Document.findById(params.id);
    if (!doc) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });

    if (doc.type === 'folder') {
      // Archive folder and children
      await Document.updateMany({ parentId: doc._id }, { isArchived: true });
    }
    await Document.findByIdAndUpdate(params.id, { isArchived: true });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
