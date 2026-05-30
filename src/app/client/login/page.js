'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';


export default function ClientLoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/client/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.requiresVerification && data.email) {
          toast.error('Please verify your email first.');
          sessionStorage.setItem('verify_email', data.email);
          router.push('/signup?verify=1');
          return;
        }
        toast.error(data.error);
        return;
      }
      toast.success('Welcome back!');
      router.push('/client/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-600/30 mb-4">
          <span className="text-emerald-400 font-bold text-lg">C</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Client Portal</h1>
        <p className="text-slate-400 text-sm">Sign in to track your projects</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="email" required
              value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              placeholder="you@company.com"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type={showPw ? 'text' : 'password'} required
              value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-colors"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign in</span><FiArrowRight size={15} /></>}
        </button>

        <p className="text-center text-slate-500 text-xs">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Create free account
          </Link>
        </p>
      </form>

      <p className="text-center text-slate-600 text-xs mt-6">
        Are you staff?{' '}
        <Link href="/staff/login" className="text-slate-400 hover:text-white">Staff login →</Link>
      </p>
    </div>
  );
}
