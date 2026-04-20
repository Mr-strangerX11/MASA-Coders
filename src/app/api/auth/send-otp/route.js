import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if email exists
      return Response.json(
        { message: 'If email exists, OTP will be sent' },
        { status: 200 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Save OTP and expiry to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - MASA Coders Admin',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px;">Password Reset</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">MASA Coders Admin Portal</p>
          </div>
          
          <div style="background: #f8fafc; padding: 40px 20px; border-radius: 0 0 12px 12px;">
            <p style="color: #1e293b; margin: 0 0 20px 0; font-size: 14px;">
              Hello,
            </p>
            
            <p style="color: #475569; margin: 0 0 30px 0; font-size: 14px; line-height: 1.6;">
              You've requested a password reset for your MASA Coders admin account. Use the OTP below to proceed:
            </p>
            
            <div style="background: #fff; border: 2px solid #e2e8f0; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
              <p style="color: #64748b; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your OTP Code</p>
              <p style="color: #0284c7; margin: 0; font-size: 42px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 0 0 30px 0;">
              <p style="color: #92400e; margin: 0; font-size: 12px;">
                ⏱️ This OTP will expire in <strong>2 minutes</strong>
              </p>
            </div>
            
            <p style="color: #475569; margin: 0 0 20px 0; font-size: 13px; line-height: 1.6;">
              If you didn't request this, please ignore this email. Your account remains secure.
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 20px;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} MASA Coders. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return Response.json(
      { message: 'OTP sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return Response.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
