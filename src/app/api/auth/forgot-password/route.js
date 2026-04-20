import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

function createTransporter() {
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      return Response.json(
        { success: true, message: 'If email exists, reset link will be sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = expiryTime;
    await user.save();

    // Send email
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const transporter = createTransporter();
    const fromAddress = `"MASA Coders" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: 'Password Reset Request - MASA Coders Admin',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px 20px; }
              .button { background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
              .footer { background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
              .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .warning p { margin: 0; color: #7f1d1d; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello ${user.name},</p>
                <p>We received a request to reset your password for your MASA Coders admin account. If you didn't make this request, you can ignore this email.</p>
                <p style="text-align: center;">
                  <a href="${resetLink}" class="button">Reset Your Password</a>
                </p>
                <p><strong>Or copy and paste this link in your browser:</strong></p>
                <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 4px; font-size: 12px; color: #0066cc;">
                  ${resetLink}
                </p>
                <div class="warning">
                  <p>⏰ This link will expire in 24 hours for security reasons.</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                  If you continue to have problems, contact our support team for further assistance.
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0;">© ${new Date().getFullYear()} MASA Coders. All rights reserved.</p>
                <p style="margin: 10px 0 0 0;">This is a secure, automated message. Please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return Response.json(
      { success: true, message: 'Password reset email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
