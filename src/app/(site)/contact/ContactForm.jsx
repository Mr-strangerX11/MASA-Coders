'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';

const services = ['Web Design & Development', 'Mobile App Development', 'E-commerce Solutions', 'Digital Marketing', 'SEO Optimization', 'Brand Identity', 'Other'];
const budgets  = ['Under Rs. 50,000', 'Rs. 50,000–1,50,000', 'Rs. 1,50,000–3,00,000', 'Rs. 3,00,000–7,50,000', 'Rs. 7,50,000+', 'Let\'s discuss'];

export default function ContactForm() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', service: '', budget: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', phone: '', service: '', budget: '', subject: '', message: '' });
    } catch (error) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = 'w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

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
          <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')} className={fieldClass} />
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
          <>Send Message <FiSend className="w-4 h-4" /></>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">
        By submitting this form, you agree to our Privacy Policy. We respect your privacy and will never share your information.
      </p>
    </form>
  );
}
