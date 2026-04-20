import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return Response.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if OTP is correct and not expired
    if (user.otp !== otp) {
      return Response.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return Response.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // OTP is valid
    return Response.json(
      { message: 'OTP verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return Response.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
