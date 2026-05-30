'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiHelpCircle, FiArrowRight } from 'react-icons/fi';

const STATUS_COLORS = { open:'bg-blue-500/15 text-blue-400', in_progress:'bg-yellow-500/15 text-yellow-400', waiting_client:'bg-purple-500/15 text-purple-400', resolved:'bg-emerald-500/15 text-emerald-400', closed:'bg-slate-500/15 text-slate-400' };
const PRIORITY_COLORS = { urgent:'text-red-400 bg-red-500/10', high:'text-orange-400 bg-orange-500/10', medium:'text-yellow-400 bg-yellow-500/10', low:'text-slate-400 bg-white/5' };

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/tickets${qs}&limit=50`).then(r=>r.json()).then(d=>setTickets(d.tickets||[])).finally(()=>setLoading(false));
  }, [statusFilter]);

  const filtered = tickets.filter(t => !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.toLowerCase()));

  const openCount     = tickets.filter(t=>t.status==='open').length;
  const progressCount = tickets.filter(t=>t.status==='in_progress').length;
  const resolvedCount = tickets.filter(t=>t.status==='resolved').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-slate-400 text-sm mt-0.5">{tickets.length} ticket{tickets.length!==1?'s':''} total</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[{label:'Open',count:openCount,color:'text-blue-400'},{label:'In Progress',count:progressCount,color:'text-yellow-400'},{label:'Resolved',count:resolvedCount,color:'text-emerald-400'}].map(({label,count,color})=>(
          <div key={label} className="bg-white/3 border border-white/8 rounded-2xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-slate-400 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets..."
            className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['','open','in_progress','waiting_client','resolved','closed'].map(s=>(
            <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter===s?'bg-white/15 text-white':'text-slate-400 hover:text-white hover:bg-white/8'}`}>
              {s?s.replace('_',' ').replace(/\b\w/g,c=>c.toUpperCase()):'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-20 bg-white/3 rounded-xl animate-pulse"/>)}</div> :
      filtered.length===0 ? <div className="text-center py-20 text-slate-500">No tickets.</div> :
      <div className="space-y-2">
        {filtered.map(t=>(
          <Link key={t._id} href={`/admin/tickets/${t._id}`} className="block bg-white/3 border border-white/8 rounded-xl p-4 hover:border-white/15 transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-slate-500 text-xs font-mono">{t.ticketNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${PRIORITY_COLORS[t.priority]}`}>{t.priority}</span>
                  <span className="text-slate-600 text-xs capitalize">{t.category?.replace('_',' ')}</span>
                </div>
                <div className="text-white font-medium text-sm">{t.subject}</div>
                <div className="text-slate-500 text-xs mt-1">{t.clientId?.name} {t.clientId?.company?`· ${t.clientId.company}`:''}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[t.status]||'bg-white/5 text-slate-400'}`}>{t.status?.replace('_',' ')}</span>
                <span className="text-slate-600 text-xs">{new Date(t.updatedAt).toLocaleDateString()}</span>
                <FiArrowRight size={14} className="text-slate-600"/>
              </div>
            </div>
          </Link>
        ))}
      </div>}
    </div>
  );
}
