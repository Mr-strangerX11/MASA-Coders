'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiBriefcase, FiPlus, FiSearch, FiUsers, FiCalendar, FiArrowRight } from 'react-icons/fi';

const STATUS_COLORS = { active:'bg-emerald-500/15 text-emerald-400', planning:'bg-blue-500/15 text-blue-400', on_hold:'bg-yellow-500/15 text-yellow-400', review:'bg-purple-500/15 text-purple-400', completed:'bg-slate-500/15 text-slate-400', draft:'bg-slate-600/15 text-slate-500', cancelled:'bg-red-500/15 text-red-400' };
const PRIORITY_COLORS = { urgent:'text-red-400', high:'text-orange-400', medium:'text-yellow-400', low:'text-slate-400' };

export default function AdminWorkProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/work-projects${qs}&limit=50`).then(r=>r.json()).then(d=>setProjects(d.projects||[])).finally(()=>setLoading(false));
  }, [statusFilter]);

  const filtered = projects.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    active:    projects.filter(p=>p.status==='active').length,
    planning:  projects.filter(p=>p.status==='planning').length,
    completed: projects.filter(p=>p.status==='completed').length,
    on_hold:   projects.filter(p=>p.status==='on_hold').length,
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage all client projects and tasks</p>
        </div>
        <Link href="/admin/work-projects/create" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors">
          <FiPlus size={15}/> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(stats).map(([key, val]) => (
          <button key={key} onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
            className={`p-4 rounded-2xl border text-left transition-all ${statusFilter === key ? 'border-blue-500/30 bg-blue-600/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}
          >
            <div className="text-2xl font-bold text-white">{val}</div>
            <div className={`text-xs font-medium capitalize mt-0.5 ${STATUS_COLORS[key]?.split(' ')[1] || 'text-slate-400'}`}>{key.replace('_',' ')}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..."
            className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
          />
        </div>
        {statusFilter && <button onClick={()=>setStatusFilter('')} className="text-xs text-slate-400 hover:text-white px-3 py-2 bg-white/5 rounded-xl">Clear filter</button>}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="h-48 bg-white/3 rounded-2xl animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No projects found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <Link key={p._id} href={`/admin/work-projects/${p._id}`} className="block bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:(p.color||'#6366f1')+'20',border:`1px solid ${(p.color||'#6366f1')}30`}}>
                    <FiBriefcase size={14} style={{color:p.color||'#6366f1'}}/>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm group-hover:text-white">{p.title}</div>
                    <div className="text-slate-500 text-xs">{p.clientId?.name || 'No client'}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0 ${STATUS_COLORS[p.status]||'bg-white/5 text-slate-400'}`}>{p.status?.replace('_',' ')}</span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-500">Progress</span><span className="text-white font-medium">{p.progress||0}%</span></div>
                <div className="w-full h-1.5 rounded-full bg-white/8"><div className="h-full rounded-full bg-blue-500" style={{width:`${p.progress||0}%`}}/></div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                {p.deadline && <span className="flex items-center gap-1"><FiCalendar size={10}/>{new Date(p.deadline).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>}
                <span className="flex items-center gap-1"><FiUsers size={10}/>{(p.teamIds||[]).length}</span>
                <span className={`ml-auto font-medium ${PRIORITY_COLORS[p.priority]}`}>{p.priority}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
