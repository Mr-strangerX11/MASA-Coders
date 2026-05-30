'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiHelpCircle, FiArrowRight, FiX } from 'react-icons/fi';

function StatusBadge({ status }) {
  const map = { open:'bg-blue-500/15 text-blue-400', in_progress:'bg-yellow-500/15 text-yellow-400', waiting_client:'bg-purple-500/15 text-purple-400', resolved:'bg-emerald-500/15 text-emerald-400', closed:'bg-slate-500/15 text-slate-400' };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${map[status] || 'bg-white/5 text-slate-400'}`}>{status?.replace('_', ' ')}</span>;
}
function PriorityBadge({ priority }) {
  const map = { urgent:'text-red-400', high:'text-orange-400', medium:'text-yellow-400', low:'text-slate-400' };
  return <span className={`text-[10px] font-semibold uppercase ${map[priority]}`}>{priority}</span>;
}

export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [form, setForm]       = useState({ subject: '', description: '', category: 'general', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  async function loadTickets() {
    fetch('/api/tickets?limit=50').then(r => r.json()).then(d => setTickets(d.tickets || [])).finally(() => setLoading(false));
  }

  useEffect(() => { loadTickets(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Ticket created!');
      setShowNew(false);
      setForm({ subject: '', description: '', category: 'general', priority: 'medium' });
      loadTickets();
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = tickets.filter(t => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-slate-400 text-sm mt-0.5">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
          <FiPlus size={15} /> New Ticket
        </button>
      </div>

      {/* New Ticket Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold">New Support Ticket</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-white"><FiX size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Subject</label>
                <input required value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} placeholder="Brief description of your issue" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {['general','billing','technical','project','bug','feature_request'].map(c => <option key={c} value={c}>{c.replace('_',' ').replace(/\b\w/g,l=>l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({...p, priority: e.target.value}))} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea required value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={5} placeholder="Please describe your issue in detail..." className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500/50 placeholder-slate-600 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 py-2.5 bg-white/5 text-slate-300 rounded-xl text-sm hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600" />
        </div>
        <div className="flex gap-2">
          {['all','open','in_progress','resolved','closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_,i) => <div key={i} className="h-20 bg-white/3 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FiHelpCircle className="mx-auto text-slate-600 mb-3" size={32} />
          <div className="text-slate-500 text-sm">No tickets found.</div>
          <button onClick={() => setShowNew(true)} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">Create your first ticket →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <Link key={t._id} href={`/client/tickets/${t._id}`} className="block bg-white/3 border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-500 text-xs font-mono">{t.ticketNumber}</span>
                    <span className="text-slate-600">·</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="text-white font-medium text-sm truncate">{t.subject}</div>
                  <div className="text-slate-500 text-xs mt-1 capitalize">{t.category?.replace('_', ' ')}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={t.status} />
                  <FiArrowRight size={14} className="text-slate-600" />
                </div>
              </div>
              <div className="text-slate-600 text-xs mt-2">{new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
