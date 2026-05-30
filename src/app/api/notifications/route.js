export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { requireAnyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const filter = { userId: decoded.id };
    if (unreadOnly) filter.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ userId: decoded.id, isRead: false }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// PATCH /api/notifications — mark all as read or specific IDs
export async function PATCH(request) {
  try {
    const decoded = await requireAnyAuth(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { ids } = body;

    const filter = { userId: decoded.id };
    if (ids?.length) filter._id = { $in: ids };

    await Notification.updateMany(filter, { isRead: true, readAt: new Date() });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
