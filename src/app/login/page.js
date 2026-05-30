'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

function getDashboard(role) {
  if (role === 'client') return '/client/dashboard';
  if (role === 'admin')  return '/admin/dashboard';
  return '/staff/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      toast.error('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const clientRes  = await fetch('/api/client/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const clientData = await clientRes.json();

      if (clientRes.ok) {
        toast.success(`Welcome back, ${clientData.user?.name?.split(' ')[0] || 'there'}!`);
        router.push('/client/dashboard');
        return;
      }

      if (clientData.requiresVerification && clientData.email) {
        toast.error('Please verify your email first.');
        sessionStorage.setItem('verify_email', clientData.email);
        router.push('/signup?verify=1');
        return;
      }

      const staffRes  = await fetch('/api/staff/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const staffData = await staffRes.json();

      if (staffRes.ok) {
        toast.success(`Welcome back, ${staffData.user?.name?.split(' ')[0] || 'there'}!`);
        router.push(getDashboard(staffData.user?.role));
        return;
      }

      toast.error('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none"/>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-3xl pointer-events-none"/>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to continue to your portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 backdrop-blur-sm shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                <input
                  type="email" required autoFocus
                  value={form.email} onChange={set('email')}
                  placeholder="you@company.com"
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition placeholder-slate-700"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                <Link href="/admin/forgot-password" className="text-xs text-slate-600 hover:text-blue-400 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <FiLock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"/>
                <input
                  type={showPw ? 'text' : 'password'} required
                  value={form.password} onChange={set('password')}
                  placeholder="Your password"
                  className="w-full bg-white/[0.05] border border-white/[0.08] text-white rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition placeholder-slate-700"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPw ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/25 border-t-white rounded-full animate-spin"/>
                : <><span>Sign In</span><FiArrowRight size={14}/></>
              }
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]"/></div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] text-slate-700 bg-[#080e1a]">New to MASA Coders?</span>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/[0.08] text-slate-400 text-sm font-medium hover:border-blue-500/30 hover:text-blue-400 hover:bg-blue-500/5 transition-all duration-200"
          >
            Create a free account <FiArrowRight size={13}/>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
