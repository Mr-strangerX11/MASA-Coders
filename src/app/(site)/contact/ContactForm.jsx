'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiSend, FiCheck, FiArrowRight, FiUser } from 'react-icons/fi';
import Link from 'next/link';

const services = ['Web Design & Development', 'Mobile App Development', 'E-commerce Solutions', 'Digital Marketing', 'SEO Optimization', 'Brand Identity', 'Other'];
const budgets  = ['Under Rs. 50,000', 'Rs. 50,000–1,50,000', 'Rs. 1,50,000–3,00,000', 'Rs. 3,00,000–7,50,000', 'Rs. 7,50,000+', 'Let\'s discuss'];

export default function ContactForm() {
  const router = useRouter();
  const [form, setForm]         = useState({ name: '', email: '', phone: '', service: '', budget: '', subject: '', message: '' });
  const [createAccount, setCreateAccount] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setSubmitted(true);

      // If they want a client account, pre-fill email and redirect to signup
      if (createAccount) {
        sessionStorage.setItem('signup_prefill', JSON.stringify({ name: form.name, email: form.email }));
        setTimeout(() => router.push('/signup?from=contact'), 1500);
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <FiCheck className="w-8 h-8 text-emerald-600"/>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
        <p className="text-slate-500 text-sm mb-6">
          We&apos;ll get back to you within 24 hours at <strong>{form.email}</strong>.
        </p>

        {createAccount ? (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
              <span className="text-blue-700 font-semibold text-sm">Redirecting to sign up…</span>
            </div>
            <p className="text-blue-600 text-xs">Your email is pre-filled. Just set a password to activate your portal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              <FiUser className="w-4 h-4"/>
              Create a free client account
              <FiArrowRight className="w-4 h-4"/>
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', service: '', budget: '', subject: '', message: '' }); }}
              className="w-full py-3 px-5 border border-slate-200 text-slate-600 font-medium rounded-xl hover:border-slate-300 transition-colors text-sm"
            >
              Send another message
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name <span className="text-red-500">*</span></label>
          <input type="text" placeholder="Your full name" value={form.name} onChange={set('name')} className={fieldClass} required />
        </div>
        <div>
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} className={fieldClass} required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Phone</label>
          <input type="tel" placeholder="+977 98XXXXXXXX" value={form.phone} onChange={set('phone')} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Service Needed</label>
          <select value={form.service} onChange={set('service')} className={fieldClass}>
            <option value="">Select a service</option>
            {services.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Budget Range</label>
          <select value={form.budget} onChange={set('budget')} className={fieldClass}>
            <option value="">Select budget</option>
            {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Subject</label>
          <input type="text" placeholder="Project subject" value={form.subject} onChange={set('subject')} className={fieldClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Message <span className="text-red-500">*</span></label>
        <textarea
          rows={5}
          placeholder="Tell us about your project, goals, and timeline..."
          value={form.message}
          onChange={set('message')}
          className={`${fieldClass} resize-none`}
          required
        />
      </div>

      {/* Sign-up option */}
      <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-blue-100 bg-blue-50 cursor-pointer hover:border-blue-300 transition-colors">
        <div className="mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={createAccount}
            onChange={e => setCreateAccount(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600"
          />
        </div>
        <div>
          <span className="text-slate-900 font-semibold text-sm block">Create a free client portal account</span>
          <span className="text-slate-500 text-xs">Track your project, view invoices, and chat with our team — all in one place.</span>
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          <>{createAccount ? 'Send & Create Account' : 'Send Message'} <FiSend className="w-4 h-4" /></>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">
        By submitting this form, you agree to our Privacy Policy. We respect your privacy and will never share your information.
      </p>
    </form>
  );
}
