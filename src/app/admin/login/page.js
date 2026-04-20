'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function LoginForm() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const router       = useRouter();
  const searchParams = useSearchParams();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Invalid email or password'); return; }
      toast.success('Welcome back!');
      const from = searchParams.get('from') || '/admin/dashboard';
      router.push(from);
      router.refresh();
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
        <div className="relative">
          <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="info@masacoders.tech"
            required
            autoComplete="email"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
        <div className="relative">
          <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type={show ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </span>
        ) : 'Sign In to Dashboard'}
      </button>

      <div className="text-center mt-4">
        <a href="/admin/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
          Forgot Password?
        </a>
      </div>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <Image src="/logo.png" alt="MASA Coders" width={48} height={48} style={{ width: 'auto', height: 'auto' }} />
            <span className="font-display font-bold text-2xl text-white">
              MASA <span className="text-blue-500">Coders</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">Admin Portal — Secure Access</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-display font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Enter your credentials to access the dashboard</p>

          {/* Suspense required for useSearchParams in static pages */}
          <Suspense fallback={<div className="h-48 flex items-center justify-center"><span className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          © {new Date().getFullYear()} MASA Coders. Secure Admin Area.
        </p>
      </div>
    </div>
  );
}
