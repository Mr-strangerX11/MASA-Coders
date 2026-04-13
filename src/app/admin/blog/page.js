'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { slugify, formatDate } from '@/lib/utils';

const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1';

export default function AdminBlogPage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(null);

  const fetch_ = async () => {
    const res  = await fetch('/api/blog?admin=true&limit=50');
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const deletePost = async (id) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/blog/${id}`, { method:'DELETE' });
    toast.success('Deleted'); fetch_();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = form._id ? 'PUT' : 'POST';
    const url    = form._id ? `/api/blog/${form._id}` : '/api/blog';
    const payload = { ...form, tags: form.tags?.split(',').map(t=>t.trim()).filter(Boolean) };
    const res = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (res.ok) { toast.success(form._id ? 'Updated' : 'Created'); setForm(null); fetch_(); }
    else toast.error('Failed to save');
  };

  const blank = { title:'', slug:'', excerpt:'', content:'', thumbnail:'', category:'General', tags:'', author:'MASA Coders Team', status:'draft', isFeatured:false, readTime:5 };

  if (form !== null) return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setForm(null)} className="p-2 rounded-lg bg-white/5 text-slate-400">← Back</button>
        <h1 className="text-xl font-display font-bold text-white">{form._id ? 'Edit Post' : 'New Blog Post'}</h1>
      </div>
      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value,slug:form._id?form.slug:slugify(e.target.value)})} required className={inputClass}/></div>
            <div><label className={labelClass}>Slug</label><input value={form.slug||''} onChange={e=>setForm({...form,slug:e.target.value})} className={inputClass}/></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className={labelClass}>Category</label><input value={form.category||''} onChange={e=>setForm({...form,category:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Author</label><input value={form.author||''} onChange={e=>setForm({...form,author:e.target.value})} className={inputClass}/></div>
            <div><label className={labelClass}>Read Time (min)</label><input type="number" value={form.readTime||5} onChange={e=>setForm({...form,readTime:+e.target.value})} min={1} className={inputClass}/></div>
          </div>
          <div><label className={labelClass}>Tags (comma separated)</label><input value={form.tags||''} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="design, seo, marketing" className={inputClass}/></div>
          <div><label className={labelClass}>Thumbnail URL</label><input type="url" value={form.thumbnail||''} onChange={e=>setForm({...form,thumbnail:e.target.value})} className={inputClass}/></div>
          <div><label className={labelClass}>Excerpt</label><textarea rows={2} value={form.excerpt||''} onChange={e=>setForm({...form,excerpt:e.target.value})} maxLength={300} className={`${inputClass} resize-none`}/></div>
          <div><label className={labelClass}>Content *</label><textarea rows={12} value={form.content||''} onChange={e=>setForm({...form,content:e.target.value})} required placeholder="Write your blog post content here..." className={`${inputClass} resize-none font-mono text-xs`}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-sm"><input type="checkbox" checked={form.isFeatured||false} onChange={e=>setForm({...form,isFeatured:e.target.checked})} className="accent-blue-600"/> Featured post</label>
        </div>
        <div className="flex gap-4"><button type="submit" className="btn-primary">Save Post</button><button type="button" onClick={()=>setForm(null)} className="btn-secondary">Cancel</button></div>
      </form>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-display font-bold text-white">Blog Posts</h1><p className="text-slate-500 text-sm mt-1">Manage your blog content</p></div>
        <button onClick={() => setForm(blank)} className="btn-primary"><FiPlus className="w-4 h-4"/> New Post</button>
      </div>
      {loading ? <div className="text-slate-500 text-center py-20">Loading...</div> : (
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          {posts.length === 0 ? (
            <div className="text-center py-20"><p className="text-slate-400 mb-4">No posts yet</p><button onClick={() => setForm(blank)} className="btn-primary"><FiPlus className="w-4 h-4"/> Create First Post</button></div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-white/8">{['Title','Category','Status','Views','Date','Actions'].map(h=><th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/5">
                {posts.map(p => (
                  <tr key={p._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium max-w-xs truncate">{p.title}</p>
                      {p.isFeatured && <span className="badge bg-amber-500/20 text-amber-300 text-xs border border-amber-500/30 mt-0.5">Featured</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{p.category}</td>
                    <td className="px-5 py-4">
                      <span className={`badge text-xs ${p.status==='published'?'status-published':p.status==='archived'?'status-archived':'status-draft'}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm">{p.views||0}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(p.createdAt,{month:'short',day:'numeric',year:'numeric'})}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setForm({...p, tags:(p.tags||[]).join(', ')})} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><FiEdit2 className="w-4 h-4"/></button>
                        <button onClick={() => deletePost(p._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><FiTrash2 className="w-4 h-4"/></button>
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
