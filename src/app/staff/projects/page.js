'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiBriefcase, FiSearch, FiUsers, FiCalendar, FiArrowRight } from 'react-icons/fi';

const STATUS_COLORS = { active:'bg-emerald-500/15 text-emerald-400', planning:'bg-blue-500/15 text-blue-400', on_hold:'bg-yellow-500/15 text-yellow-400', review:'bg-purple-500/15 text-purple-400', completed:'bg-slate-500/15 text-slate-400' };

export default function StaffProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    fetch('/api/work-projects?limit=50').then(r=>r.json()).then(d=>setProjects(d.projects||[])).finally(()=>setLoading(false));
  }, []);

  const filtered = projects.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">{projects.length} project{projects.length!==1?'s':''} assigned</p>
        </div>
      </div>

      <div className="relative mb-6 max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..."
          className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
        />
      </div>

      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-48 bg-white/3 rounded-2xl animate-pulse"/>)}</div> :
      filtered.length === 0 ? <div className="text-center py-20 text-slate-500">No projects found.</div> :
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(p => (
          <Link key={p._id} href={`/staff/projects/${p._id}`} className="block bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:(p.color||'#6366f1')+'20',border:`1px solid ${(p.color||'#6366f1')}30`}}>
                  <FiBriefcase size={16} style={{color:p.color||'#6366f1'}} />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{p.title}</h3>
                  <div className="text-slate-500 text-xs capitalize">{p.type}</div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[p.status]||'bg-white/5 text-slate-400'}`}>{p.status?.replace('_',' ')}</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Progress</span><span className="text-white font-medium">{p.progress||0}%</span></div>
              <div className="w-full h-1.5 rounded-full bg-white/8"><div className="h-full rounded-full bg-violet-500" style={{width:`${p.progress||0}%`}} /></div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              {p.deadline && <span className="flex items-center gap-1"><FiCalendar size={10}/>{new Date(p.deadline).toLocaleDateString()}</span>}
              <span className="flex items-center gap-1"><FiUsers size={10}/>{(p.teamIds||[]).length} members</span>
              <span className="ml-auto">{p.doneCount||0}/{p.taskCount||0} tasks</span>
            </div>
          </Link>
        ))}
      </div>}
    </div>
  );
}
