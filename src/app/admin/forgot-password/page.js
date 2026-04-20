'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FiMail, FiArrowLeft, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('email'); // email, otp, password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  // OTP Timer
  useEffect(() => {
    let interval;
    if (step === 'otp' && otpSent && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && otpSent) {
      setOtpSent(false);
      setOtp('');
      toast.error('OTP expired. Please request a new one.');
    }
    return () => clearInterval(interval);
  }, [step, otpSent, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      toast.success('OTP sent to your email!');
      setStep('otp');
      setOtpSent(true);
      setTimeLeft(120);
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter the OTP');
      return;
    }

    if (timeLeft === 0) {
      toast.error('OTP expired. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      toast.success('OTP verified!');
      setStep('password');
      setOtpSent(false);
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/admin/login'), 1500);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to resend OTP');
        setLoading(false);
        return;
      }

      toast.success('OTP resent to your email!');
      setOtp('');
      setOtpSent(true);
      setTimeLeft(120);
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp('');
      setOtpSent(false);
      setTimeLeft(120);
    } else if (step === 'password') {
      setStep('otp');
      setPassword('');
      setConfirmPassword('');
    } else {
      router.push('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-12 h-12 relative">
              <Image src="/logo.png" alt="MASA Coders" fill sizes="48px" style={{ objectFit: 'contain' }} />
            </div>
            <span className="font-display font-bold text-2xl text-white">
              MASA <span className="text-blue-500">Coders</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">Admin Portal — Password Reset</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Email Step */}
          {step === 'email' && (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Reset your password</h1>
              <p className="text-slate-400 text-sm mb-8">Enter your email address to receive an OTP</p>

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@masacoders.tech"
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    We'll send you a 6-digit OTP code to verify your identity
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send OTP'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Verify OTP</h1>
              <p className="text-slate-400 text-sm mb-8">Enter the 6-digit code sent to {email}</p>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">One-Time Password</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-slate-500 text-xs">
                      Enter the code from your email
                    </p>
                    {otpSent && (
                      <p className={`text-xs font-semibold ${timeLeft <= 30 ? 'text-red-400' : 'text-blue-400'}`}>
                        Expires in {formatTime(timeLeft)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !otpSent}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="w-full py-2.5 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium disabled:opacity-60"
                >
                  Resend OTP
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <>
              <h1 className="text-2xl font-display font-bold text-white mb-1">Create New Password</h1>
              <p className="text-slate-400 text-sm mb-8">Enter and confirm your new password</p>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">Minimum 6 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          © {new Date().getFullYear()} MASA Coders. Secure Admin Area.
        </p>
      </div>
    </div>
  );
}
