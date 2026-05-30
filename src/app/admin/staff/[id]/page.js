'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiSave, FiUser, FiMail, FiBriefcase, FiPhone,
  FiCheckCircle, FiXCircle, FiClock, FiAward, FiFileText, FiCalendar,
  FiToggleRight, FiToggleLeft,
} from 'react-icons/fi';

const DEPARTMENTS = ['Engineering','Design','Marketing','Sales','Finance','HR','Operations','Management'];
const ROLE_COLORS = { admin:'bg-red-500/15 text-red-400', manager:'bg-orange-500/15 text-orange-400', editor:'bg-blue-500/15 text-blue-400', staff:'bg-violet-500/15 text-violet-400' };

function StatBadge({ icon: Icon, label, value, color = 'text-white' }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
      <Icon className={`mx-auto mb-1.5 ${color}`} size={18}/>
      <div className={`text-xl font-bold ${color}`}>{value ?? '—'}</div>
      <div className="text-slate-500 text-[10px] mt-0.5">{label}</div>
    </div>
  );
}

export default function AdminStaffEditPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [user, setUser]     = useState(null);
  const [stats, setStats]   = useState(null);
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    fetch(`/api/staff-management/${id}`)
      .then(r => { if (!r.ok) { router.push('/admin/staff'); return null; } return r.json(); })
      .then(d => {
        if (!d) return;
        setUser(d.user);
        setStats(d.stats);
        setForm({
          name:       d.user.name       || '',
          email:      d.user.email      || '',
          phone:      d.user.phone      || '',
          role:       d.user.role       || 'staff',
          department: d.user.department || '',
          jobTitle:   d.user.jobTitle   || '',
          salary:     d.user.salary     || 0,
          bio:        d.user.bio        || '',
          skills:     d.user.skills     || [],
          isActive:   d.user.isActive,
          joiningDate:d.user.joiningDate ? d.user.joiningDate.split('T')[0] : '',
          timezone:   d.user.timezone   || 'Asia/Kathmandu',
        });
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function update(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })); }

  function addSkill() {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  }

  function removeSkill(skill) {
    setForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/staff-management/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, salary: parseFloat(form.salary) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setUser(data.user);
      toast.success('Staff profile updated!');
    } finally { setSaving(false); }
  }

  async function toggleActive() {
    const res = await fetch(`/api/staff-management/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !form.isActive }),
    });
    if (res.ok) {
      setForm(p => ({ ...p, isActive: !p.isActive }));
      toast.success(form.isActive ? 'Staff deactivated.' : 'Staff activated.');
    }
  }

  if (loading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded-xl mb-4"/>
        <div className="h-40 bg-white/3 rounded-2xl mb-6"/>
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_,i) => <div key={i} className="h-20 bg-white/3 rounded-xl"/>)}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link href="/admin/staff" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14}/> Back to Staff
      </Link>

      {/* Profile header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {user?.avatar ?  <img src={user.avatar} className="w-full h-full rounded-2xl object-cover" alt=""/> : user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${ROLE_COLORS[user?.role] || 'bg-white/5 text-slate-400'}`}>{user?.role}</span>
              {user?.department && <span className="text-slate-500 text-xs">{user.department}</span>}
              {user?.jobTitle   && <span className="text-slate-500 text-xs">· {user.jobTitle}</span>}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${form.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-slate-500 text-xs mt-1">{user?.employeeId} · {user?.email}</div>
          </div>
        </div>
        <button onClick={toggleActive} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-colors ${form.isActive ? 'bg-red-600/10 border-red-600/20 text-red-400 hover:bg-red-600/20' : 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400 hover:bg-emerald-600/20'}`}>
          {form.isActive ? <><FiToggleRight size={14}/> Deactivate</> : <><FiToggleLeft size={14}/> Activate</>}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <StatBadge icon={FiCheckCircle} label="Tasks Done"    value={stats.taskBreakdown?.done || 0}        color="text-emerald-400"/>
          <StatBadge icon={FiClock}       label="In Progress"   value={stats.taskBreakdown?.in_progress || 0} color="text-yellow-400"/>
          <StatBadge icon={FiXCircle}     label="Overdue"       value={stats.taskBreakdown?.overdue || 0}     color={stats.taskBreakdown?.overdue > 0 ? 'text-red-400' : 'text-slate-500'}/>
          <StatBadge icon={FiFileText}    label="Reports (mo.)" value={stats.reportCount}                     color="text-blue-400"/>
          <StatBadge icon={FiCalendar}    label="Present (mo.)" value={stats.attendanceCount}                 color="text-violet-400"/>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/8 mb-6">
        {['profile', 'employment', 'security'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${activeTab === tab ? 'text-white border-white' : 'text-slate-400 border-transparent hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {activeTab === 'profile' && (
          <>
            <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-medium text-sm">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Full Name</label>
                  <input value={form.name} onChange={update('name')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"/>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Phone</label>
                  <input value={form.phone} onChange={update('phone')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600" placeholder="+1 234 567 8900"/>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Email (read-only)</label>
                <input value={form.email} disabled className="w-full bg-white/3 border border-white/8 text-slate-500 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed"/>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Bio</label>
                <textarea rows={3} value={form.bio} onChange={update('bio')} placeholder="Short bio or description..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 resize-none placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Skills</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {form.skills?.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/8 border border-white/10 rounded-lg text-xs text-slate-300">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-400 transition-colors"><FiXCircle size={11}/></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill (e.g. React)"
                    className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  />
                  <button type="button" onClick={addSkill} className="px-3 py-2 bg-white/8 text-slate-300 rounded-xl text-sm hover:bg-white/15 transition-colors">Add</button>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'employment' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-medium text-sm">Employment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Role</label>
                <select value={form.role} onChange={update('role')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  {['staff','manager','editor'].map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Department</label>
                <select value={form.department} onChange={update('department')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  <option value="">No department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Job Title</label>
                <input value={form.jobTitle} onChange={update('jobTitle')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600" placeholder="e.g. Senior Developer"/>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Monthly Salary (USD)</label>
                <input type="number" min="0" value={form.salary} onChange={update('salary')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Joining Date</label>
                <input type="date" value={form.joiningDate} onChange={update('joiningDate')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none"/>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Timezone</label>
                <select value={form.timezone} onChange={update('timezone')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                  {['Asia/Kathmandu','Asia/Kolkata','UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Berlin'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-medium text-sm">Account Security</h3>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-400">
              To reset this staff member&apos;s password, have them use the forgot password flow at <code className="bg-white/10 px-1.5 py-0.5 rounded">/staff/login</code>, or manually update via the database.
            </div>
            <div>
              <div className="flex justify-between py-2 border-b border-white/5 text-sm">
                <span className="text-slate-400">Account Status</span>
                <span className={form.isActive ? 'text-emerald-400' : 'text-red-400'}>{form.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5 text-sm">
                <span className="text-slate-400">Employee ID</span>
                <span className="text-white font-mono">{user?.employeeId || '—'}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-400">Last Login</span>
                <span className="text-white">{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'security' && (
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-xl font-medium transition-colors"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><FiSave size={15}/> Save Changes</>}
          </button>
        )}
      </form>
    </div>
  );
}
