'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiPlus, FiCalendar, FiClock, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';

const LEAVE_TYPES = [
  { value:'annual',     label:'Annual Leave',    emoji:'🌴', days:15 },
  { value:'sick',       label:'Sick Leave',       emoji:'🤒', days:10 },
  { value:'personal',   label:'Personal Leave',   emoji:'👤', days:5  },
  { value:'maternity',  label:'Maternity Leave',  emoji:'👶', days:90 },
  { value:'paternity',  label:'Paternity Leave',  emoji:'👨‍👧', days:14 },
  { value:'unpaid',     label:'Unpaid Leave',     emoji:'📋', days:0  },
  { value:'other',      label:'Other',            emoji:'📝', days:0  },
];

const STATUS_STYLES = {
  pending:  { bg: 'bg-yellow-500/15 border-yellow-500/20', text: 'text-yellow-400', icon: <FiClock size={12}/> },
  approved: { bg: 'bg-emerald-500/15 border-emerald-500/20', text: 'text-emerald-400', icon: <FiCheck size={12}/> },
  rejected: { bg: 'bg-red-500/15 border-red-500/20', text: 'text-red-400', icon: <FiX size={12}/> },
  cancelled:{ bg: 'bg-slate-500/15 border-slate-500/20', text: 'text-slate-400', icon: <FiX size={12}/> },
};

export default function StaffLeavesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ type:'annual', startDate:'', endDate:'', reason:'' });
  const [submitting, setSubmitting] = useState(false);

  async function loadRequests() {
    const res  = await fetch('/api/leave-requests');
    const data = await res.json();
    setRequests(data.requests || []);
    setLoading(false);
  }

  useEffect(() => { loadRequests(); }, []);

  const computedDays = form.startDate && form.endDate
    ? Math.max(1, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000) + 1)
    : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.startDate || !form.endDate) { toast.error('Select start and end dates.'); return; }
    if (new Date(form.endDate) < new Date(form.startDate)) { toast.error('End date must be after start date.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/leave-requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Leave request submitted!');
      setShowForm(false);
      setForm({ type:'annual', startDate:'', endDate:'', reason:'' });
      loadRequests();
    } finally { setSubmitting(false); }
  }

  async function cancelRequest(id) {
    const res = await fetch(`/api/leave-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    if (res.ok) { toast.success('Request cancelled.'); loadRequests(); }
  }

  // Compute leave usage
  const approved = requests.filter(r => r.status === 'approved');
  const usageMap = LEAVE_TYPES.reduce((acc, lt) => {
    acc[lt.value] = approved.filter(r => r.type === lt.value).reduce((s, r) => s + r.days, 0);
    return acc;
  }, {});

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your time off requests</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <FiPlus size={15}/> Request Leave
        </button>
      </div>

      {/* Leave balance cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {LEAVE_TYPES.filter(lt => lt.days > 0).map(lt => {
          const used      = usageMap[lt.value] || 0;
          const remaining = Math.max(0, lt.days - used);
          const pct       = lt.days > 0 ? Math.min(100, (used / lt.days) * 100) : 0;
          return (
            <div key={lt.value} className="bg-white/3 border border-white/8 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{lt.emoji}</span>
                <span className="text-white text-xs font-medium">{lt.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-white">{remaining}</span>
                <span className="text-slate-500 text-xs">/ {lt.days} days</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${pct}%` }}/>
              </div>
              <div className="text-slate-600 text-[10px] mt-1">{used} used</div>
            </div>
          );
        })}
      </div>

      {pendingCount > 0 && (
        <div className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
          <FiAlertCircle size={16} className="text-yellow-400 shrink-0"/>
          <span className="text-yellow-400 text-sm">You have <strong>{pendingCount}</strong> pending leave request{pendingCount !== 1 ? 's' : ''} awaiting approval.</span>
        </div>
      )}

      {/* New request modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">New Leave Request</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><FiX size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {LEAVE_TYPES.slice(0,6).map(lt => (
                    <button type="button" key={lt.value}
                      onClick={() => setForm(p => ({...p, type: lt.value}))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-sm transition-colors ${form.type === lt.value ? 'border-violet-500/40 bg-violet-600/15 text-white' : 'border-white/8 text-slate-400 hover:border-white/15'}`}
                    >
                      <span>{lt.emoji}</span> {lt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Start Date *</label>
                  <input type="date" required value={form.startDate} onChange={e => setForm(p => ({...p, startDate: e.target.value}))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">End Date *</label>
                  <input type="date" required value={form.endDate} onChange={e => setForm(p => ({...p, endDate: e.target.value}))}
                    min={form.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>
              {computedDays > 0 && (
                <div className="flex items-center gap-2 text-sm px-3 py-2 bg-violet-600/10 border border-violet-600/20 rounded-xl">
                  <FiCalendar size={13} className="text-violet-400"/>
                  <span className="text-violet-400 font-medium">{computedDays} day{computedDays !== 1 ? 's' : ''} leave requested</span>
                </div>
              )}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason *</label>
                <textarea required rows={3} value={form.reason} onChange={e => setForm(p => ({...p, reason: e.target.value}))}
                  placeholder="Briefly explain the reason for your leave..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-white/5 text-slate-400 rounded-xl text-sm hover:bg-white/10 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request history */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white/3 rounded-xl animate-pulse"/>)}</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No leave requests yet.</div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-sm mb-3">Request History</h2>
          {requests.map(req => {
            const lt      = LEAVE_TYPES.find(l => l.value === req.type);
            const st      = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
            const isPending = req.status === 'pending';
            return (
              <div key={req._id} className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{lt?.emoji || '📋'}</span>
                    <div>
                      <div className="text-white font-medium text-sm">{lt?.label || req.type}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <FiCalendar size={10}/>
                        {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                        <span className="text-slate-500">· {req.days} day{req.days !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${st.bg} ${st.text}`}>
                    {st.icon} {req.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed">{req.reason}</p>
                {req.reviewNote && (
                  <div className="mt-2 px-3 py-2 bg-white/3 rounded-xl text-xs text-slate-400">
                    <span className="text-slate-500">Note: </span>{req.reviewNote}
                  </div>
                )}
                {isPending && (
                  <button onClick={() => cancelRequest(req._id)}
                    className="mt-3 px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 border border-white/8 hover:border-red-500/30 rounded-xl transition-colors"
                  >
                    Cancel request
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
