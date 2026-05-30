'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiFileText, FiSmile, FiAlertCircle } from 'react-icons/fi';

const MOODS = [
  { value: 'great',   emoji: '😄', label: 'Great' },
  { value: 'good',    emoji: '🙂', label: 'Good' },
  { value: 'okay',    emoji: '😐', label: 'Okay' },
  { value: 'stressed',emoji: '😰', label: 'Stressed' },
  { value: 'bad',     emoji: '😟', label: 'Bad' },
];

export default function StaffReportsPage() {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [hasToday, setHasToday] = useState(false);
  const [form, setForm]         = useState({ summary: '', hoursWorked: '', blockers: '', nextDayPlan: '', mood: 'good' });
  const [submitting, setSubmitting] = useState(false);

  async function loadReports() {
    const res = await fetch('/api/daily-reports?limit=10');
    const data = await res.json();
    const reports = data.reports || [];
    setReports(reports);
    const today = new Date().toDateString();
    setHasToday(reports.length > 0 && new Date(reports[0].date).toDateString() === today);
    setLoading(false);
  }

  useEffect(() => { loadReports(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/daily-reports', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hoursWorked: parseFloat(form.hoursWorked) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Report submitted! +2 points 🎉');
      setForm({ summary: '', hoursWorked: '', blockers: '', nextDayPlan: '', mood: 'good' });
      loadReports();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Daily Reports</h1>
        <p className="text-slate-400 text-sm mt-0.5">Submit your daily work summary (+2 points per report)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          {hasToday ? (
            <div className="bg-emerald-600/10 border border-emerald-600/20 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-white font-semibold mb-1">Report submitted for today!</div>
              <div className="text-slate-400 text-sm">You&apos;ve already submitted your daily report. Come back tomorrow.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-semibold">Today&apos;s Report — {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Work Summary <span className="text-red-400">*</span></label>
                <textarea required rows={4} value={form.summary} onChange={e => setForm(p => ({...p, summary: e.target.value}))}
                  placeholder="What did you accomplish today? What tasks did you complete?"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Hours Worked</label>
                  <input type="number" step="0.5" min="0" max="24" value={form.hoursWorked} onChange={e => setForm(p => ({...p, hoursWorked: e.target.value}))}
                    placeholder="8"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">How are you feeling?</label>
                  <div className="flex gap-1.5">
                    {MOODS.map(m => (
                      <button key={m.value} type="button" onClick={() => setForm(p => ({...p, mood: m.value}))}
                        title={m.label}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${form.mood === m.value ? 'bg-white/20 scale-110' : 'hover:bg-white/10'}`}
                      >
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Blockers / Issues</label>
                <textarea rows={2} value={form.blockers} onChange={e => setForm(p => ({...p, blockers: e.target.value}))}
                  placeholder="Any blockers or issues that slowed you down today?"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan for Tomorrow</label>
                <textarea rows={2} value={form.nextDayPlan} onChange={e => setForm(p => ({...p, nextDayPlan: e.target.value}))}
                  placeholder="What are you planning to work on tomorrow?"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600 resize-none"
                />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiFileText size={14} /> Submit Report (+2 pts)</>}
              </button>
            </form>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-4">Recent Reports</h3>
          {loading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"/>)}</div> :
          reports.length === 0 ? <div className="text-slate-500 text-sm text-center py-8">No reports yet.</div> :
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report._id} className="p-3 bg-white/3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-xs font-medium">{new Date(report.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</span>
                  <span className="text-lg">{MOODS.find(m => m.value === report.mood)?.emoji || '🙂'}</span>
                </div>
                <p className="text-slate-400 text-xs line-clamp-2">{report.summary}</p>
                {report.hoursWorked > 0 && <div className="text-slate-600 text-xs mt-1">{report.hoursWorked}h worked</div>}
              </div>
            ))}
          </div>}
        </div>
      </div>
    </div>
  );
}
