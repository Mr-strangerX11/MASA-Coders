'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiCheck, FiX } from 'react-icons/fi';

const STATUS_COLORS = {
  present:  'bg-emerald-500/15 text-emerald-400',
  absent:   'bg-red-500/15 text-red-400',
  half_day: 'bg-yellow-500/15 text-yellow-400',
  late:     'bg-orange-500/15 text-orange-400',
  wfh:      'bg-blue-500/15 text-blue-400',
  on_leave: 'bg-purple-500/15 text-purple-400',
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function StaffAttendancePage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [todayRecord, setTodayRecord] = useState(null);
  const [checkingIn, setCheckingIn]   = useState(false);

  async function loadRecords() {
    setLoading(true);
    const res = await fetch(`/api/attendance?month=${year}-${String(month).padStart(2,'0')}`);
    const data = await res.json();
    const recs = data.records || [];
    setRecords(recs);
    const today = new Date().toDateString();
    setTodayRecord(recs.find(r => new Date(r.date).toDateString() === today) || null);
    setLoading(false);
  }

  useEffect(() => { loadRecords(); }, [year, month]);

  async function handleCheckIn() {
    setCheckingIn(true);
    try {
      const res = await fetch('/api/attendance', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(data.action === 'checkin' ? 'Checked in!' : 'Checked out! See you tomorrow.');
      setTodayRecord(data.record);
      loadRecords();
    } finally {
      setCheckingIn(false);
    }
  }

  const daysInMonth   = getDaysInMonth(year, month - 1);
  const presentCount  = records.filter(r => ['present','wfh','half_day'].includes(r.status)).length;
  const absentCount   = records.filter(r => r.status === 'absent').length;
  const totalHours    = records.reduce((s, r) => s + (r.workHours || 0), 0);

  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 text-sm mt-0.5">{monthName}</p>
        </div>
        <button onClick={handleCheckIn} disabled={checkingIn || (todayRecord?.checkIn && todayRecord?.checkOut)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            todayRecord?.checkIn && !todayRecord?.checkOut
              ? 'bg-orange-600/15 border border-orange-600/20 text-orange-400 hover:bg-orange-600/25'
              : todayRecord?.checkOut
              ? 'bg-emerald-600/15 border border-emerald-600/20 text-emerald-400 cursor-default'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          <FiClock size={14} />
          {checkingIn ? 'Loading...' : todayRecord?.checkOut ? 'Done for today ✓' : todayRecord?.checkIn ? 'Check Out' : 'Check In'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Present', value: presentCount, color: 'text-emerald-400' },
          { label: 'Absent',  value: absentCount,  color: 'text-red-400' },
          { label: 'WFH',     value: records.filter(r=>r.status==='wfh').length, color: 'text-blue-400' },
          { label: 'On Leave',value: records.filter(r=>r.status==='on_leave').length, color: 'text-purple-400' },
          { label: 'Hours',   value: `${totalHours.toFixed(1)}h`, color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/3 border border-white/8 rounded-xl p-4 text-center">
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => { if (month === 1) { setYear(y => y-1); setMonth(12); } else setMonth(m => m-1); }} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">← Prev</button>
        <span className="text-white text-sm font-medium">{monthName}</span>
        <button onClick={() => { if (month === 12) { setYear(y => y+1); setMonth(1); } else setMonth(m => m+1); }} className="text-slate-400 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">Next →</button>
      </div>

      {/* Calendar grid */}
      <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/8">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-3">{d}</div>
          ))}
        </div>
        {/* Days */}
        {!loading && (
          <div className="grid grid-cols-7">
            {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => <div key={`empty-${i}`} className="p-2 min-h-[60px]" />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const date = new Date(year, month - 1, day);
              const dateStr = date.toDateString();
              const record  = records.find(r => new Date(r.date).toDateString() === dateStr);
              const isToday = dateStr === new Date().toDateString();
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isPast  = date < new Date() && !isToday;

              return (
                <div key={day} className={`p-2 min-h-[60px] border-t border-white/5 ${isToday ? 'bg-violet-600/10' : ''}`}>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 rounded-full flex items-center justify-center ${isToday ? 'bg-violet-600 text-white' : isWeekend ? 'text-slate-600' : 'text-slate-400'}`}>{day}</div>
                  {record && (
                    <div className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${STATUS_COLORS[record.status]}`}>
                      {record.status?.replace('_','\n')}
                    </div>
                  )}
                  {isWeekend && !record && (
                    <div className="text-[9px] text-slate-700">weekend</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent log */}
      <div className="mt-6 bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/8">
          <h3 className="text-white font-medium text-sm">Attendance Log</h3>
        </div>
        {loading ? <div className="p-4 space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-10 bg-white/5 rounded animate-pulse"/>)}</div> :
        records.length === 0 ? <div className="text-center py-8 text-slate-500 text-sm">No records this month.</div> :
        <div>
          {records.map(r => (
            <div key={r._id} className="flex items-center gap-4 px-5 py-3 border-b border-white/5 last:border-0">
              <div className="text-slate-400 text-sm w-24">{new Date(r.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[r.status]}`}>{r.status?.replace('_',' ')}</span>
              <div className="flex-1 flex items-center gap-4 text-xs text-slate-500">
                {r.checkIn  && <span className="flex items-center gap-1"><FiClock size={10} /> In: {new Date(r.checkIn).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>}
                {r.checkOut && <span className="flex items-center gap-1"><FiClock size={10} /> Out: {new Date(r.checkOut).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</span>}
                {r.workHours > 0 && <span>{r.workHours.toFixed(1)}h</span>}
              </div>
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}
