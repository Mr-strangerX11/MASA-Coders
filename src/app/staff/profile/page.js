'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiBriefcase, FiPhone, FiSave, FiAward } from 'react-icons/fi';

export default function StaffProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/staff/auth').then(r=>r.json()).then(d=>{if(d.user)setUser(d.user);setLoading(false);});
  }, []);

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl"/></div>;
  if (!user) return null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">My Profile</h1>
      <div className="max-w-2xl">
        <div className="flex items-center gap-5 mb-8 p-6 bg-white/3 border border-white/8 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-violet-600/20 border-2 border-violet-600/30 flex items-center justify-center text-2xl font-bold text-violet-400 shrink-0">
            {user.avatar ?  <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt=""/> : user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white font-semibold text-lg">{user.name}</div>
            <div className="text-slate-400 text-sm">{user.email}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-600/15 text-violet-400 uppercase">{user.role}</span>
              {user.department && <span className="text-slate-500 text-xs">{user.department}</span>}
              {user.jobTitle   && <span className="text-slate-500 text-xs">· {user.jobTitle}</span>}
            </div>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          {[
            { label:'Employee ID', value: user.employeeId || '—' },
            { label:'Department',  value: user.department || '—' },
            { label:'Job Title',   value: user.jobTitle   || '—' },
            { label:'Phone',       value: user.phone      || '—' },
            { label:'Joined',      value: user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
              <span className="text-slate-400 text-sm">{label}</span>
              <span className="text-white text-sm">{value}</span>
            </div>
          ))}
        </div>

        {user.skills?.length > 0 && (
          <div className="mt-4 bg-white/3 border border-white/8 rounded-2xl p-6">
            <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2"><FiAward size={14}/>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(s => <span key={s} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-xs">{s}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
