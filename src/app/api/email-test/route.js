import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email, testType } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`🧪 Testing email with ${testType} template to: ${email}`);

    const testData = {
      name: 'Test User',
      email: email,
      message: 'This is a test email to verify your MASA Coders email configuration is working correctly.',
      subject: 'Test Email',
      phone: '+977 9705478032',
      service: 'Web Development',
    };

    const result = await sendEmail(email, testData, testType);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `✅ Test email sent successfully to ${email}`,
        messageId: result.messageId,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: `❌ Failed to send test email: ${result.error}`,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: `❌ Test email error: ${error.message}`,
    }, { status: 500 });
  }
}
