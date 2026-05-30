'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

export default function CreateStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', email:'', password:'', role:'staff', department:'', jobTitle:'', phone:'', salary:'', skills:'', joiningDate:'',
  });

  function update(f) { return e => setForm(p=>({...p,[f]:e.target.value})); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary: form.salary ? parseFloat(form.salary) : 0,
        skills: form.skills ? form.skills.split(',').map(s=>s.trim()).filter(Boolean) : [],
      };
      const res = await fetch('/api/staff-management', {
        method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Staff member added!');
      router.push('/admin/staff');
    } finally {
      setLoading(false);
    }
  }

  const DEPARTMENTS = ['Engineering','Design','Marketing','Sales','Finance','HR','Operations','Management'];

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/admin/staff" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14}/> Back to staff
      </Link>
      <h1 className="text-2xl font-bold text-white mb-8">Add Staff Member</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-medium text-sm">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
              <input required value={form.name} onChange={update('name')} placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
              <input required type="email" value={form.email} onChange={update('email')} placeholder="john@masacoders.com"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password *</label>
              <input required type="password" minLength={8} value={form.password} onChange={update('password')} placeholder="Min. 8 characters"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+1 234 567 8900"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-medium text-sm">Work Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role *</label>
              <select value={form.role} onChange={update('role')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {['staff','manager','editor'].map(r=><option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Department</label>
              <select value={form.department} onChange={update('department')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                <option value="">Select department</option>
                {DEPARTMENTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Job Title</label>
              <input value={form.jobTitle} onChange={update('jobTitle')} placeholder="e.g. Senior Developer"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Joining Date</label>
              <input type="date" value={form.joiningDate} onChange={update('joiningDate')}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Monthly Salary (USD)</label>
              <input type="number" min="0" value={form.salary} onChange={update('salary')} placeholder="0"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Skills (comma-separated)</label>
              <input value={form.skills} onChange={update('skills')} placeholder="React, Node.js, TypeScript"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-xl font-medium transition-colors"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><FiSave size={15}/> Add Staff Member</>}
        </button>
      </form>
    </div>
  );
}
