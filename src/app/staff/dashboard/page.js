'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiCheckSquare, FiBriefcase, FiClock, FiAlertCircle, FiArrowRight, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, sub, color, href }) {
  const inner = (
    <div className={`bg-white/3 border border-white/8 rounded-2xl p-5 hover:border-white/15 transition-all ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="text-white" size={17} />
        </div>
        {href && <FiArrowRight size={14} className="text-slate-600 mt-1" />}
      </div>
      <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
      <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

const PRIORITY_COLORS = { urgent: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-slate-400' };
const STATUS_COLORS = { backlog: 'bg-slate-500/20 text-slate-400', todo: 'bg-blue-500/20 text-blue-400', in_progress: 'bg-yellow-500/20 text-yellow-400', review: 'bg-purple-500/20 text-purple-400', done: 'bg-emerald-500/20 text-emerald-400' };

export default function StaffDashboardPage() {
  const [user, setUser]         = useState(null);
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [hasReport, setHasReport] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [uRes, tRes, pRes, aRes, rRes] = await Promise.all([
          fetch('/api/staff/auth'),
          fetch('/api/tasks?limit=10'),
          fetch('/api/work-projects?limit=5'),
          fetch('/api/attendance'),
          fetch('/api/daily-reports?limit=1'),
        ]);
        const [u, t, p, a, r] = await Promise.all([uRes.json(), tRes.json(), pRes.json(), aRes.json(), rRes.json()]);
        setUser(u.user);
        setTasks(t.tasks || []);
        setProjects(p.projects || []);
        const today = new Date().toDateString();
        const todayRecord = (a.records || []).find(rec => new Date(rec.date).toDateString() === today);
        setTodayAttendance(todayRecord || null);
        setHasReport((r.reports || []).length > 0 && new Date((r.reports[0])?.date).toDateString() === today);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCheckIn() {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setTodayAttendance(data.record);
      toast.success(data.action === 'checkin' ? 'Checked in successfully!' : 'Checked out. Have a great day!');
    } finally {
      setCheckingIn(false);
    }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl mb-8" /><div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-28 bg-white/3 rounded-2xl"/>)}</div></div>;

  const activeTasks  = tasks.filter(t => ['todo','in_progress'].includes(t.status)).length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
  const doneTasks    = tasks.filter(t => t.status === 'done').length;
  const inProgress   = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">You have {activeTasks} active task{activeTasks !== 1 ? 's' : ''} today.</p>
        </div>
        {/* Attendance button */}
        <button onClick={handleCheckIn} disabled={checkingIn}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            todayAttendance?.checkIn && !todayAttendance?.checkOut
              ? 'bg-orange-600/15 border border-orange-600/20 text-orange-400 hover:bg-orange-600/25'
              : todayAttendance?.checkOut
              ? 'bg-emerald-600/15 border border-emerald-600/20 text-emerald-400 cursor-default'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          <FiClock size={14} />
          {todayAttendance?.checkOut ? 'Checked Out' : todayAttendance?.checkIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      {/* Alerts */}
      {overdueTasks > 0 && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
          <FiAlertCircle size={16} className="text-red-400 shrink-0" />
          <div className="text-sm text-red-400">You have <strong>{overdueTasks} overdue task{overdueTasks !== 1 ? 's' : ''}</strong>. Please complete them as soon as possible.</div>
          <Link href="/staff/tasks?filter=overdue" className="ml-auto text-red-400 hover:text-red-300 text-xs shrink-0">View →</Link>
        </div>
      )}
      {!hasReport && (
        <div className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
          <FiFileIcon size={16} className="text-yellow-400 shrink-0" />
          <div className="text-sm text-yellow-400">Don&apos;t forget to submit your <strong>daily report</strong> today (+2 points).</div>
          <Link href="/staff/reports" className="ml-auto text-yellow-400 hover:text-yellow-300 text-xs shrink-0">Submit →</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiCheckSquare}  label="Active Tasks"    value={activeTasks}    color="bg-violet-600"  href="/staff/tasks" />
        <StatCard icon={FiTrendingUp}   label="In Progress"     value={inProgress}     color="bg-blue-600" />
        <StatCard icon={FiCheckSquare}  label="Completed"       value={doneTasks}      color="bg-emerald-600" sub="All time" />
        <StatCard icon={FiAlertCircle}  label="Overdue"         value={overdueTasks}   color={overdueTasks > 0 ? 'bg-red-600' : 'bg-slate-700'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-sm">My Tasks</h2>
            <Link href="/staff/tasks" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">View all <FiArrowRight size={12} /></Link>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No tasks assigned.</div>
          ) : (
            <div className="space-y-2">
              {tasks.filter(t => t.status !== 'done').slice(0,5).map(task => (
                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${task.status === 'in_progress' ? 'bg-yellow-400' : 'bg-slate-600'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{task.title}</div>
                    {task.dueDate && <div className="text-slate-500 text-xs flex items-center gap-1"><FiCalendar size={9} />{new Date(task.dueDate).toLocaleDateString()}</div>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[task.status]}`}>{task.status?.replace('_',' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Projects */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold text-sm">Active Projects</h2>
            <Link href="/staff/projects" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">View all <FiArrowRight size={12} /></Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No projects assigned.</div>
          ) : (
            <div className="space-y-3">
              {projects.filter(p => p.status === 'active').slice(0,4).map(p => (
                <Link key={p._id} href={`/staff/projects/${p._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: (p.color||'#6366f1')+'20', border:`1px solid ${(p.color||'#6366f1')}30` }}>
                    <FiBriefcase size={13} style={{ color: p.color||'#6366f1' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm truncate">{p.title}</div>
                    <div className="w-full h-1 rounded-full bg-white/8 mt-1">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: `${p.progress||0}%` }} />
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs">{p.progress||0}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function FiFileIcon({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
