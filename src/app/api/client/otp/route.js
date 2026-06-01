export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/apiHelpers';
import { emailWelcomeClient } from '@/lib/sendPlatformEmail';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Singleton transport — created once, reused across requests (avoids TCP handshake per OTP)
let _transport = null;
function getTransport() {
  if (_transport) return _transport;
  const user = process.env.EMAIL_USER || process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_PASSWORD;
  const host = process.env.EMAIL_HOST;

  _transport = (!host || host === 'smtp.gmail.com')
    ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
    : nodemailer.createTransport({
        host,
        port:   parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth:   { user, pass },
        tls:    { rejectUnauthorized: process.env.NODE_ENV === 'production' },
      });

  return _transport;
}

// Cryptographically secure 6-digit OTP (uniform distribution, no Math.random bias)
function generateOtp() {
  return String(crypto.randomInt(100_000, 1_000_000));
}

// Throws on failure — caller decides how to handle
async function sendOtpEmail(email, otp, name) {
  const user = process.env.EMAIL_USER || process.env.EMAIL_FROM;
  if (!user) throw new Error('Email not configured. Set EMAIL_USER in .env.local');

  const from = `"MASA Coders" <${user}>`;
  const transport = getTransport();

  await transport.sendMail({
    from,
    to: email,
    subject: `${otp} — Verify your MASA Coders account`,
    html: `
      <!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f1f5f9;padding:32px">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
        <div style="background:#6366f1;padding:32px 40px">
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">MASA Coders</h1>
          <p style="color:rgba(255,255,255,.75);margin:4px 0 0;font-size:14px">Client Portal Verification</p>
        </div>
        <div style="padding:32px 40px">
          <h2 style="font-size:18px;font-weight:700;margin:0 0 8px">Hi ${name || 'there'}!</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6">Use this code to verify your email address. It expires in <strong>10 minutes</strong>.</p>
          <div style="margin:24px 0;text-align:center">
            <div style="display:inline-block;background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:20px 40px">
              <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#0f172a;font-family:monospace">${otp}</span>
            </div>
          </div>
          <p style="color:#94a3b8;font-size:12px">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
      </body></html>
    `,
  });
}

// POST /api/client/otp?action=send|verify
export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'send') {
    try {
      const ip = getClientIp(request);
      const limited = await rateLimit(`otp-send:${ip}`, 5, 600);
      if (!limited.ok) return NextResponse.json({ error: 'Too many OTP requests. Try again later.' }, { status: 429 });

      const { email } = await request.json();
      if (!email) return NextResponse.json({ error: 'Email required.' }, { status: 400 });

      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase(), role: 'client' });
      if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      if (user.isVerified) return NextResponse.json({ error: 'Email already verified. Please sign in.' }, { status: 400 });

      const otp    = generateOtp();
      const expiry = new Date(Date.now() + 10 * 60 * 1_000); // 10 minutes

      user.otp       = otp;
      user.otpExpiry = expiry;
      await user.save();

      try {
        await sendOtpEmail(user.email, otp, user.name);
      } catch (emailErr) {
        console.error('[OTP] Email send failed:', emailErr.message);
        return NextResponse.json({
          error: `Could not send email: ${emailErr.message}. Check your EMAIL_USER / EMAIL_PASSWORD in .env.local — Gmail requires an App Password if 2FA is enabled.`,
        }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: `OTP sent to ${email}` });
    } catch (err) {
      console.error('OTP send error:', err);
      return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
  }

  if (action === 'verify') {
    try {
      const ip = getClientIp(request);
      const limited = await rateLimit(`otp-verify:${ip}`, 10, 600);
      if (!limited.ok) return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });

      const { email, otp } = await request.json();
      if (!email || !otp) return NextResponse.json({ error: 'Email and OTP required.' }, { status: 400 });

      await connectDB();
      const user = await User.findOne({ email: email.toLowerCase(), role: 'client' });
      if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

      if (user.isVerified) {
        // Already verified — just log in
        const token = signToken({ id: user._id, role: 'client', email: user.email });
        setAuthCookie(token, 'client');
        return NextResponse.json({ ok: true, user: user.toJSON() });
      }

      // Check OTP
      if (!user.otp || !user.otpExpiry) {
        return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
      }
      if (new Date() > new Date(user.otpExpiry)) {
        return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 });
      }
      if (user.otp !== otp.trim()) {
        return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 });
      }

      // Mark verified and clear OTP
      user.isVerified  = true;
      user.otp         = null;
      user.otpExpiry   = null;
      user.lastLoginAt = new Date();
      await user.save();

      // Send welcome email on first verification
      emailWelcomeClient(user.toJSON()).catch(() => {});

      // Issue session cookie
      const token = signToken({ id: user._id, role: 'client', email: user.email });
      setAuthCookie(token, 'client');

      return NextResponse.json({ ok: true, user: user.toJSON() });
    } catch (err) {
      console.error('OTP verify error:', err);
      return NextResponse.json({ error: 'Server error.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid action. Use ?action=send or ?action=verify' }, { status: 400 });
}
