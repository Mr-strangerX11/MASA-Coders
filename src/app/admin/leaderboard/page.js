'use client';
import { useEffect, useState } from 'react';
import { FiAward, FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const BADGE_COLORS = {
  diamond: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  platinum:'bg-slate-300/20 text-slate-200 border-slate-400/30',
  gold:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  silver:  'bg-slate-400/20 text-slate-300 border-slate-400/30',
  bronze:  'bg-orange-700/20 text-orange-400 border-orange-700/30',
};

const BADGE_EMOJI = { diamond:'💎', platinum:'🏆', gold:'🥇', silver:'🥈', bronze:'🥉' };

const RANK_ICON = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

export default function LeaderboardPage() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState('monthly');
  const [dept, setDept]       = useState('');
  const [depts, setDepts]     = useState([]);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ period, ...(dept && { department: dept }) });
    const res = await fetch(`/api/leaderboard?${qs}`);
    const d   = await res.json();
    setData(d.leaderboard || []);
    const uniqueDepts = [...new Set((d.leaderboard||[]).map(s=>s.department).filter(Boolean))];
    setDepts(uniqueDepts);
    setLoading(false);
  }

  useEffect(() => { load(); }, [period, dept]);

  const top3 = data.slice(0, 3);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3"><FiAward size={24} className="text-yellow-400"/>Leaderboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Staff performance rankings</p>
        </div>
        <div className="flex gap-2">
          {['weekly','monthly','yearly'].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${period===p?'bg-white/15 text-white':'text-slate-400 hover:text-white hover:bg-white/8'}`}>{p}</button>
          ))}
        </div>
      </div>

      {depts.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={()=>setDept('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!dept?'bg-white/15 text-white':'text-slate-400 hover:text-white hover:bg-white/8'}`}>All</button>
          {depts.map(d=><button key={d} onClick={()=>setDept(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${dept===d?'bg-white/15 text-white':'text-slate-400 hover:text-white hover:bg-white/8'}`}>{d}</button>)}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-20 bg-white/3 rounded-xl animate-pulse"/>)}</div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No data for this period.</div>
      ) : (
        <>
          {/* Top 3 podium */}
          {top3.length > 0 && (
            <div className="flex justify-center gap-4 mb-10 flex-wrap">
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
                const isFirst = entry.rank === 1;
                return (
                  <div key={entry.userId} className={`flex flex-col items-center bg-white/3 border border-white/8 rounded-2xl p-5 ${isFirst ? 'scale-110 border-yellow-500/30 bg-yellow-500/5' : ''} w-40`}>
                    <div className="text-2xl mb-2">{RANK_ICON(entry.rank)}</div>
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white mb-2">
                      {entry.avatar ?  <img src={entry.avatar} className="w-full h-full rounded-full object-cover" alt=""/> : entry.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="text-white font-semibold text-sm text-center">{entry.name}</div>
                    <div className="text-slate-500 text-xs text-center mb-2">{entry.department||'—'}</div>
                    <div className="text-xl font-bold text-white">{entry.score}</div>
                    <div className="text-slate-500 text-[10px]">points</div>
                    {entry.badge && (
                      <span className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${BADGE_COLORS[entry.badge]}`}>
                        {BADGE_EMOJI[entry.badge]} {entry.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 w-10">Rank</th>
                  <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Staff</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Done</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3 hidden lg:table-cell">On Time</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3 hidden lg:table-cell">Reports</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3 hidden md:table-cell">Hours</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Score</th>
                  <th className="text-center text-xs font-medium text-slate-400 px-4 py-3">Badge</th>
                </tr>
              </thead>
              <tbody>
                {data.map(entry => (
                  <tr key={entry.userId} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-slate-400 text-sm font-medium">{entry.rank <= 3 ? RANK_ICON(entry.rank) : `#${entry.rank}`}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                          {entry.avatar?<img src={entry.avatar} className="w-full h-full rounded-full object-cover" alt=""/>:entry.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-sm font-medium">{entry.name}</div>
                          <div className="text-slate-500 text-xs">{entry.department||'—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <FiCheckCircle size={11} className="text-emerald-400"/>
                        <span className="text-white text-sm">{entry.tasksCompleted}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell"><span className="text-emerald-400 text-sm">{entry.tasksOnTime}</span></td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell"><span className="text-blue-400 text-sm">{entry.dailyReports}</span></td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-slate-400 text-sm">{entry.hoursLogged?.toFixed(0)}h</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-white font-bold text-sm">{entry.score}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${BADGE_COLORS[entry.badge]}`}>
                          {entry.badge}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scoring legend */}
          <div className="mt-6 bg-white/3 border border-white/8 rounded-xl p-4">
            <h3 className="text-white text-xs font-medium mb-3">Scoring Rules</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                {label:'Task completed', pts:'+10', color:'text-emerald-400'},
                {label:'On-time delivery', pts:'+5', color:'text-blue-400'},
                {label:'Client approval', pts:'+8', color:'text-purple-400'},
                {label:'Daily report', pts:'+2', color:'text-yellow-400'},
                {label:'Late completion', pts:'-3', color:'text-orange-400'},
                {label:'Bug report', pts:'-5', color:'text-orange-400'},
                {label:'Missed deadline', pts:'-10', color:'text-red-400'},
              ].map(({label,pts,color})=>(
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-medium ${color}`}>{pts}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
