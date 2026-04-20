import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown';
    const { allowed, resetIn } = rateLimit(`subscribe:${ip}`, { limit: 3, windowMs: 60_000 });
    if (!allowed) {
      return NextResponse.json({ error: `Too many requests. Please wait ${resetIn}s.` }, { status: 429 });
    }

    await connectDB();
    const { name, email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if already subscribed
    const existing = await Subscription.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: 'You are already subscribed to our newsletter' }, { status: 400 });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        await existing.save();
      }
    } else {
      // Get IP address
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

      // Create new subscription
      await Subscription.create({
        name: name || '',
        email: email.toLowerCase(),
        ip,
      });
    }

    // Send thank you email to subscriber
    const emailResult = await sendEmail(
      email,
      { name, email },
      'subscription'
    );

    if (!emailResult.success) {
      console.warn('Email sending failed but subscription was saved:', emailResult.error);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed! Check your email for confirmation.' 
    }, { status: 201 });
  } catch (error) {
    console.error('Subscription error:', error.message);
    return NextResponse.json({ error: error.message || 'Server error. Please try again later.' }, { status: 500 });
  }
}
