'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Link from 'next/link';

export default function CreateWorkProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [staff, setStaff]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    title: '', description: '', clientId: '', managerId: '', teamIds: [],
    status: 'planning', priority: 'medium', type: 'web',
    startDate: '', deadline: '', budget: '', currency: 'USD',
    color: '#6366f1', progress: 0,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/staff-management').then(r=>r.json()),
    ]).then(([s]) => {
      setStaff(s.staff || []);
    });
    // Load clients (users with role=client)
    fetch('/api/client/auth').then(() => {}); // placeholder — use staff-management for clients
  }, []);

  function update(field) { return e => setForm(p => ({...p, [field]: e.target.value})); }

  function toggleTeam(id) {
    setForm(p => ({
      ...p,
      teamIds: p.teamIds.includes(id) ? p.teamIds.filter(x=>x!==id) : [...p.teamIds, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title) { toast.error('Title is required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/work-projects', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, budget: form.budget ? parseFloat(form.budget) : 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Project created!');
      router.push(`/admin/work-projects/${data.project._id}`);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#10b981','#14b8a6','#0ea5e9','#3b82f6','#64748b'];

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/admin/work-projects" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14}/> Back to projects
      </Link>
      <h1 className="text-2xl font-bold text-white mb-8">New Work Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-medium text-sm">Project Details</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Title *</label>
            <input required value={form.title} onChange={update('title')} placeholder="e.g. ACME Corp Website Redesign"
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={update('description')} placeholder="Project overview and objectives..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
              <select value={form.status} onChange={update('status')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {['draft','planning','active','on_hold','review','completed','cancelled'].map(s=><option key={s} value={s}>{s.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
              <select value={form.priority} onChange={update('priority')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {['low','medium','high','urgent'].map(p=><option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Type</label>
              <select value={form.type} onChange={update('type')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {['web','mobile','design','marketing','consulting','other'].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p=>({...p,color:c}))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color===c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0d1117]':''}`}
                  style={{backgroundColor:c}}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-medium text-sm">Timeline & Budget</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={update('startDate')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={update('deadline')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Budget</label>
              <input type="number" min="0" value={form.budget} onChange={update('budget')} placeholder="0"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency</label>
              <select value={form.currency} onChange={update('currency')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {['USD','EUR','GBP','NPR','INR','AUD'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-medium text-sm">Team Assignment</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Manager</label>
            <select value={form.managerId} onChange={update('managerId')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
              <option value="">Select manager</option>
              {staff.filter(s=>['admin','manager'].includes(s.role)).map(s=><option key={s._id} value={s._id}>{s.name} ({s.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Team Members</label>
            <div className="grid grid-cols-2 gap-2">
              {staff.map(s => (
                <button key={s._id} type="button" onClick={() => toggleTeam(s._id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${form.teamIds.includes(s._id) ? 'border-blue-500/30 bg-blue-600/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}
                >
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {s.avatar ?  <img src={s.avatar} className="w-full h-full rounded-full object-cover" alt=""/> : s.name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-xs font-medium truncate">{s.name}</div>
                    <div className="text-slate-500 text-[10px] truncate">{s.jobTitle || s.role}</div>
                  </div>
                  {form.teamIds.includes(s._id) && <div className="ml-auto w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center"><span className="text-white text-[9px]">✓</span></div>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl font-medium transition-colors"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><FiSave size={15}/>Create Project</>}
        </button>
      </form>
    </div>
  );
}
