'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiUser, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const ROLE_COLORS = { admin:'bg-red-500/15 text-red-400', manager:'bg-orange-500/15 text-orange-400', editor:'bg-blue-500/15 text-blue-400', staff:'bg-violet-500/15 text-violet-400' };

export default function AdminStaffPage() {
  const [staff, setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  async function loadStaff() {
    const qs = roleFilter ? `?role=${roleFilter}` : '';
    fetch(`/api/staff-management${qs}`).then(r=>r.json()).then(d=>setStaff(d.staff||[])).finally(()=>setLoading(false));
  }

  useEffect(() => { loadStaff(); }, [roleFilter]);

  async function toggleActive(s) {
    const res = await fetch(`/api/staff-management/${s._id}`, {
      method: 'PATCH', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    if (res.ok) { toast.success(s.isActive ? 'Staff deactivated.' : 'Staff activated.'); loadStaff(); }
  }

  const filtered = staff.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const depts = [...new Set(staff.map(s => s.department).filter(Boolean))];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">{staff.length} team member{staff.length!==1?'s':''}</p>
        </div>
        <Link href="/admin/staff/create" className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors">
          <FiPlus size={15}/> Add Staff
        </Link>
      </div>

      {/* Summary by dept */}
      {depts.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {depts.map(dept => (
            <div key={dept} className="px-3 py-1.5 bg-white/3 border border-white/8 rounded-lg text-xs">
              <span className="text-slate-400">{dept}</span>
              <span className="text-white font-medium ml-2">{staff.filter(s=>s.department===dept).length}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..."
            className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
          />
        </div>
        <div className="flex gap-2">
          {['','admin','manager','editor','staff'].map(r => (
            <button key={r} onClick={()=>setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${roleFilter===r ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}
            >
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No staff found.</div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Name</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 hidden md:table-cell">Department</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 hidden lg:table-cell">Title</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Role</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Status</th>
                <th className="px-5 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {s.avatar?<img src={s.avatar} className="w-full h-full rounded-full object-cover" alt=""/>:s.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{s.name}</div>
                        <div className="text-slate-500 text-xs">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell"><span className="text-slate-400 text-sm">{s.department||'—'}</span></td>
                  <td className="px-5 py-3 hidden lg:table-cell"><span className="text-slate-400 text-sm">{s.jobTitle||'—'}</span></td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${ROLE_COLORS[s.role]||'bg-white/5 text-slate-400'}`}>{s.role}</span></td>
                  <td className="px-5 py-3 hidden lg:table-cell"><span className="text-slate-400 text-xs">{s.joiningDate?new Date(s.joiningDate).toLocaleDateString():'—'}</span></td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.isActive?'bg-emerald-500/15 text-emerald-400':'bg-red-500/15 text-red-400'}`}>
                      {s.isActive?'Active':'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/staff/${s._id}`} className="text-slate-400 hover:text-white transition-colors"><FiEdit2 size={14}/></Link>
                      <button onClick={()=>toggleActive(s)} className={`transition-colors ${s.isActive?'text-emerald-400 hover:text-red-400':'text-red-400 hover:text-emerald-400'}`}>
                        {s.isActive?<FiToggleRight size={16}/>:<FiToggleLeft size={16}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
