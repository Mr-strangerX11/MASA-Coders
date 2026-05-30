'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiBriefcase, FiPhone, FiSave, FiMapPin } from 'react-icons/fi';

export default function ClientProfilePage() {
  const [user, setUser]       = useState(null);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    fetch('/api/client/auth').then(r => r.json()).then(d => {
      if (d.user) { setUser(d.user); setForm(d.user); }
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/client/auth', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, phone: form.phone, company: form.company }),
      });
      if (res.ok) toast.success('Profile updated!');
      else toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">My Profile</h1>

      <div className="max-w-2xl">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 p-6 bg-white/3 border border-white/8 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-600/20 border-2 border-emerald-600/30 flex items-center justify-center text-2xl font-bold text-emerald-400 shrink-0">
            {user?.avatar ?  <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" /> : user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold text-lg">{user?.name}</div>
            <div className="text-slate-400 text-sm">{user?.email}</div>
            <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600/15 text-emerald-400 uppercase">Client</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
          {[
            { field: 'name',    label: 'Full Name',  icon: FiUser,      type: 'text' },
            { field: 'phone',   label: 'Phone',      icon: FiPhone,     type: 'tel' },
            { field: 'company', label: 'Company',    icon: FiBriefcase, type: 'text' },
          ].map(({ field, label, icon: Icon, type }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input type={type} value={form[field] || ''} onChange={e => setForm(p => ({...p, [field]: e.target.value}))}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input type="email" value={user?.email || ''} disabled className="w-full bg-white/3 border border-white/8 text-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm cursor-not-allowed" />
            </div>
            <p className="text-slate-600 text-xs mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>

          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
            <FiSave size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
