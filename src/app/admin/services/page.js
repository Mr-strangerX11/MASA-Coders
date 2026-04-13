'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { slugify } from '@/lib/utils';

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1';

const iconOptions = ['FiCode','FiSmartphone','FiLayout','FiTrendingUp','FiSearch','FiZap','FiShoppingCart','FiBriefcase','FiGlobe','FiStar'];

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(null);

  const fetch_ = async () => {
    const res  = await fetch('/api/services?admin=true');
    const data = await res.json();
    setServices(data.services || []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const toggleVisible = async (id, isVisible) => {
    await fetch(`/api/services/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isVisible: !isVisible }) });
    toast.success(`Service ${isVisible ? 'hidden' : 'shown'}`);
    fetch_();
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    await fetch(`/api/services/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    fetch_();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...form, features: form.features?.split('\n').map(f => f.trim()).filter(Boolean) };
    const method = form._id ? 'PUT' : 'POST';
    const url    = form._id ? `/api/services/${form._id}` : '/api/services';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(form._id ? 'Updated' : 'Created'); setForm(null); fetch_(); }
    else toast.error('Failed to save');
  };

  const blank = { title:'', slug:'', icon:'FiCode', description:'', shortDesc:'', features:'', price:'', duration:'', isVisible:true, isFeatured:false, order:0 };

  if (form !== null) return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setForm(null)} className="p-2 rounded-lg bg-white/5 text-slate-400">← Back</button>
        <h1 className="text-xl font-display font-bold text-white">{form._id ? 'Edit Service' : 'New Service'}</h1>
      </div>
      <form onSubmit={handleSave} className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Title *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: form._id ? form.slug : slugify(e.target.value)})} required className={inputClass} /></div>
          <div><label className={labelClass}>Icon</label>
            <select value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className={inputClass}>
              {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div><label className={labelClass}>Short Description</label><input value={form.shortDesc||''} onChange={e => setForm({...form, shortDesc: e.target.value})} maxLength={200} className={inputClass} /></div>
        <div><label className={labelClass}>Full Description *</label><textarea rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required className={`${inputClass} resize-none`} /></div>
        <div><label className={labelClass}>Features (one per line)</label><textarea rows={5} value={form.features||''} onChange={e => setForm({...form, features: e.target.value})} placeholder="Custom design&#10;Mobile-first&#10;SEO optimized" className={`${inputClass} resize-none`} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Price</label><input value={form.price||''} onChange={e => setForm({...form, price: e.target.value})} placeholder="Starting at Rs. 14,999" className={inputClass} /></div>
          <div><label className={labelClass}>Duration</label><input value={form.duration||''} onChange={e => setForm({...form, duration: e.target.value})} placeholder="2-4 weeks" className={inputClass} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Order</label><input type="number" value={form.order||0} onChange={e => setForm({...form, order: +e.target.value})} className={inputClass} /></div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm"><input type="checkbox" checked={form.isVisible} onChange={e => setForm({...form, isVisible: e.target.checked})} className="accent-blue-600" /> Visible</label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="accent-blue-600" /> Featured</label>
        </div>
        <div className="flex gap-4"><button type="submit" className="btn-primary">Save</button><button type="button" onClick={() => setForm(null)} className="btn-secondary">Cancel</button></div>
      </form>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-display font-bold text-white">Services</h1><p className="text-slate-500 text-sm mt-1">Manage your service offerings</p></div>
        <button onClick={() => setForm(blank)} className="btn-primary"><FiPlus className="w-4 h-4" /> New Service</button>
      </div>
      {loading ? <div className="text-slate-500 text-center py-20">Loading...</div> : (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          {services.length === 0 ? (
            <div className="text-center py-20"><p className="text-slate-400 mb-4">No services yet</p><button onClick={() => setForm(blank)} className="btn-primary"><FiPlus className="w-4 h-4" /> Add First Service</button></div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-white/8">{['Service','Price','Duration','Visible','Featured','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {services.map(s => (
                  <tr key={s._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{s.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">{s.shortDesc||s.description}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{s.price||'—'}</td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{s.duration||'—'}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleVisible(s._id, s.isVisible)} className={`p-1.5 rounded-lg transition-colors ${s.isVisible?'text-green-400 bg-green-400/10':'text-slate-500 hover:text-green-400'}`}>
                        {s.isVisible ? <FiEye className="w-4 h-4"/> : <FiEyeOff className="w-4 h-4"/>}
                      </button>
                    </td>
                    <td className="px-5 py-4"><span className={`badge text-xs ${s.isFeatured?'bg-amber-500/20 text-amber-300 border border-amber-500/30':'bg-slate-500/20 text-slate-500 border border-slate-500/20'}`}>{s.isFeatured?'Yes':'No'}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setForm({...s, features: (s.features||[]).join('\n')})} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><FiEdit2 className="w-4 h-4"/></button>
                        <button onClick={() => deleteService(s._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><FiTrash2 className="w-4 h-4"/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
