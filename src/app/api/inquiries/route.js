import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';

function isAdmin() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  return token ? !!verifyToken(token) : false;
}

// Public: Submit inquiry | Admin: Get all inquiries
export async function GET(request) {
  try {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isRead = searchParams.get('isRead');
    const skip = (page - 1) * limit;

    const query = isRead !== null && isRead !== undefined ? { isRead: isRead === 'true' } : {};
    const [inquiries, total, unreadCount] = await Promise.all([
      Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Inquiry.countDocuments(query),
      Inquiry.countDocuments({ isRead: false }),
    ]);

    return NextResponse.json({ inquiries, total, unreadCount, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, resetIn } = rateLimit(`inquiry:${ip}`, { limit: 3, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: `Too many requests. Please wait ${resetIn}s before trying again.` }, { status: 429 });
    }

    await connectDB();
    const data = await request.json();
    const { name, email, message } = data;
    
    if (!name || !email || !message) {
      return NextResponse.json({ 
        error: 'Name, email and message are required' 
      }, { status: 400 });
    }
    
    const inquiry = await Inquiry.create({ ...data, ip });

    // Send thank you email to the user
    const emailResult = await sendEmail(
      email,
      data,
      'contact'
    );

    if (!emailResult.success) {
      console.warn('Email sending failed but inquiry was saved:', emailResult.error);
    }

    return NextResponse.json({ 
      success: true, 
      inquiry,
      message: 'Inquiry submitted successfully! Check your email for confirmation.' 
    }, { status: 201 });
  } catch (error) {
    console.error('Inquiry error:', error.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to submit inquiry. Please try again later.' 
    }, { status: 500 });
  }
}
