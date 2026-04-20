import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp, password } = await request.json();

    if (!email || !otp || !password) {
      return Response.json(
        { error: 'Email, OTP, and password are required' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify OTP
    if (user.otp !== otp) {
      return Response.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return Response.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Update password
    user.password = password;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return Response.json(
      { message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return Response.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
