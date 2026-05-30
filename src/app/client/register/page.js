'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiBriefcase, FiPhone, FiArrowRight } from 'react-icons/fi';

export default function ClientRegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: '', email: '', password: '', company: '', phone: '' });
  const [loading, setLoading] = useState(false);

  function update(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/client/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Account created! Welcome.');
      router.push('/client/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-600/30 mb-4">
          <span className="text-emerald-400 font-bold text-lg">C</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
        <p className="text-slate-400 text-sm">Join the client portal to track your projects</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-4">
        {[
          { field: 'name',     label: 'Full name',    icon: FiUser,      type: 'text',  placeholder: 'John Doe',           required: true },
          { field: 'email',    label: 'Email address',icon: FiMail,      type: 'email', placeholder: 'you@company.com',    required: true },
          { field: 'company',  label: 'Company',      icon: FiBriefcase, type: 'text',  placeholder: 'Acme Corp',          required: false },
          { field: 'phone',    label: 'Phone',        icon: FiPhone,     type: 'tel',   placeholder: '+1 234 567 8900',    required: false },
        ].map(({ field, label, icon: Icon, type, placeholder, required }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input
                type={type} required={required}
                value={form[field]} onChange={update(field)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-colors"
              />
            </div>
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="password" required minLength={8}
              value={form.password} onChange={update('password')}
              placeholder="Min. 8 characters"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create account</span><FiArrowRight size={15} /></>}
        </button>

        <p className="text-center text-slate-500 text-xs">
          Already have an account?{' '}
          <Link href="/client/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
