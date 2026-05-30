'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function StaffLoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/staff/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Welcome, ${data.user?.name?.split(' ')[0]}!`);
      router.push('/staff/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-600/30 mb-4">
          <span className="text-violet-400 font-bold text-lg">S</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Staff Portal</h1>
        <p className="text-slate-400 text-sm">Sign in with your staff credentials</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input type="email" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
              placeholder="staff@masacoders.com"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600 transition-colors"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign in</span><FiArrowRight size={15} /></>}
        </button>
      </form>

      <p className="text-center text-slate-600 text-xs mt-6">
        Are you a client?{' '}
        <Link href="/client/login" className="text-slate-400 hover:text-white">Client login →</Link>
      </p>
    </div>
  );
}
