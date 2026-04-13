'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiStar } from 'react-icons/fi';

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1';

export default function AdminTestimonialsPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(null);

  const fetch_ = async () => {
    const res = await fetch('/api/testimonials?admin=true');
    setItems((await res.json()).testimonials || []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const togglePublish = async (id, isPublished) => {
    await fetch(`/api/testimonials/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({isPublished: !isPublished}) });
    toast.success(isPublished ? 'Unpublished' : 'Published');
    fetch_();
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/testimonials/${id}`, { method:'DELETE' });
    toast.success('Deleted'); fetch_();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = form._id ? 'PUT' : 'POST';
    const url    = form._id ? `/api/testimonials/${form._id}` : '/api/testimonials';
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
    if (res.ok) { toast.success(form._id ? 'Updated' : 'Created'); setForm(null); fetch_(); }
    else toast.error('Failed to save');
  };

  const blank = { name:'', role:'', company:'', avatar:'', content:'', rating:5, project:'', isPublished:false, isFeatured:false, order:0 };

  if (form !== null) return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setForm(null)} className="p-2 rounded-lg bg-white/5 text-slate-400">← Back</button>
        <h1 className="text-xl font-display font-bold text-white">{form._id ? 'Edit Testimonial' : 'New Testimonial'}</h1>
      </div>
      <form onSubmit={handleSave} className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Name *</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required className={inputClass}/></div>
          <div><label className={labelClass}>Rating (1-5)</label>
            <select value={form.rating} onChange={e => setForm({...form,rating:+e.target.value})} className={inputClass}>
              {[5,4,3,2,1].map(r=><option key={r} value={r}>{r} Stars</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Role</label><input value={form.role||''} onChange={e => setForm({...form,role:e.target.value})} placeholder="CEO" className={inputClass}/></div>
          <div><label className={labelClass}>Company</label><input value={form.company||''} onChange={e => setForm({...form,company:e.target.value})} className={inputClass}/></div>
        </div>
        <div><label className={labelClass}>Review Content *</label><textarea rows={4} value={form.content} onChange={e => setForm({...form,content:e.target.value})} required className={`${inputClass} resize-none`}/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Avatar URL</label><input value={form.avatar||''} onChange={e => setForm({...form,avatar:e.target.value})} placeholder="https://..." className={inputClass}/></div>
          <div><label className={labelClass}>Project Name</label><input value={form.project||''} onChange={e => setForm({...form,project:e.target.value})} className={inputClass}/></div>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form,isPublished:e.target.checked})} className="accent-blue-600"/> Published</label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm"><input type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form,isFeatured:e.target.checked})} className="accent-blue-600"/> Featured</label>
        </div>
        <div className="flex gap-4"><button type="submit" className="btn-primary">Save</button><button type="button" onClick={() => setForm(null)} className="btn-secondary">Cancel</button></div>
      </form>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-display font-bold text-white">Testimonials</h1><p className="text-slate-500 text-sm mt-1">Manage client reviews and social proof</p></div>
        <button onClick={() => setForm(blank)} className="btn-primary"><FiPlus className="w-4 h-4"/> New Testimonial</button>
      </div>
      {loading ? <div className="text-slate-500 text-center py-20">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-white/5 rounded-2xl border border-white/8">
              <p className="text-slate-400 mb-4">No testimonials yet</p>
              <button onClick={() => setForm(blank)} className="btn-primary"><FiPlus className="w-4 h-4"/> Add First Testimonial</button>
            </div>
          ) : items.map(t => (
            <div key={t._id} className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{t.name}</span>
                    {t.isFeatured && <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/>}
                  </div>
                  <span className="text-slate-500 text-xs">{t.role}{t.company ? `, ${t.company}` : ''}</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({length:t.rating}).map((_,i)=><FiStar key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400"/>)}
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">"{t.content}"</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className={`badge text-xs ${t.isPublished?'bg-green-500/20 text-green-400 border border-green-500/30':'bg-slate-500/20 text-slate-500 border border-slate-500/20'}`}>{t.isPublished?'Published':'Draft'}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => togglePublish(t._id, t.isPublished)} className={`p-1.5 rounded-lg transition-colors ${t.isPublished?'text-green-400':'text-slate-500 hover:text-green-400'}`}>{t.isPublished?<FiEye className="w-4 h-4"/>:<FiEyeOff className="w-4 h-4"/>}</button>
                  <button onClick={() => setForm(t)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><FiEdit2 className="w-4 h-4"/></button>
                  <button onClick={() => deleteItem(t._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><FiTrash2 className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
