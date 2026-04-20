import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectDB();

    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return Response.json(
        { error: 'Token, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
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

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    return Response.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return Response.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
