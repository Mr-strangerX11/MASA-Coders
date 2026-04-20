import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectDB();

    const { token, email } = await request.json();

    if (!token || !email) {
      return Response.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and valid expiry
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return Response.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return Response.json(
      { success: true, message: 'Token is valid' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token validation error:', error);
    return Response.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
