'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiDollarSign, FiFileText, FiTrendingUp, FiAlertCircle, FiArrowRight, FiPlus } from 'react-icons/fi';

const STATUS_COLORS = { draft:'bg-slate-500/15 text-slate-400', sent:'bg-blue-500/15 text-blue-400', viewed:'bg-purple-500/15 text-purple-400', paid:'bg-emerald-500/15 text-emerald-400', overdue:'bg-red-500/15 text-red-400', cancelled:'bg-slate-600/15 text-slate-500' };

export default function AdminFinancePage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');

  useEffect(() => {
    const qs = filter ? `?status=${filter}` : '';
    fetch(`/api/invoices${qs}&limit=50`).then(r=>r.json()).then(d=>setInvoices(d.invoices||[])).finally(()=>setLoading(false));
  }, [filter]);

  const totalRevenue   = invoices.filter(i=>i.status==='paid').reduce((s,i)=>s+i.total,0);
  const totalPending   = invoices.filter(i=>['sent','viewed'].includes(i.status)).reduce((s,i)=>s+i.total,0);
  const totalOverdue   = invoices.filter(i=>i.status==='overdue').reduce((s,i)=>s+i.total,0);
  const overdueCount   = invoices.filter(i=>i.status==='overdue').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance</h1>
          <p className="text-slate-400 text-sm mt-0.5">Invoices and payment management</p>
        </div>
        <Link href="/admin/finance/invoices/create" className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition-colors">
          <FiPlus size={15}/> New Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label:'Total Revenue', value:`$${totalRevenue.toFixed(0)}`,  icon:FiDollarSign,  color:'bg-emerald-600', sub:`${invoices.filter(i=>i.status==='paid').length} paid` },
          { label:'Outstanding',   value:`$${totalPending.toFixed(0)}`,  icon:FiFileText,    color:'bg-blue-600',    sub:`${invoices.filter(i=>['sent','viewed'].includes(i.status)).length} invoices` },
          { label:'Overdue',       value:`$${totalOverdue.toFixed(0)}`,  icon:FiAlertCircle, color:overdueCount>0?'bg-red-600':'bg-slate-700', sub:`${overdueCount} invoices` },
          { label:'All Invoices',  value:invoices.length,               icon:FiTrendingUp,  color:'bg-slate-700',   sub:'' },
        ].map(({ label, value, icon:Icon, color, sub }) => (
          <div key={label} className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon className="text-white" size={17}/></div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">{label}</div>
            {sub && <div className="text-xs text-slate-600 mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['','draft','sent','viewed','paid','overdue'].map(s=>(
          <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter===s?'bg-white/15 text-white':'text-slate-400 hover:text-white hover:bg-white/8'}`}>
            {s?s.charAt(0).toUpperCase()+s.slice(1):'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse"/>)}</div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No invoices.</div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Invoice</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Client</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 hidden md:table-cell">Project</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 hidden lg:table-cell">Due Date</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv=>(
                <tr key={inv._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white text-sm font-medium">{inv.invoiceNumber}</div>
                    <div className="text-slate-500 text-xs">{new Date(inv.issueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-slate-300 text-sm">{inv.clientId?.name}</div>
                    <div className="text-slate-500 text-xs">{inv.clientId?.company}</div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell"><span className="text-slate-400 text-sm">{inv.projectId?.title||'—'}</span></td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className={`text-sm ${inv.status==='overdue'?'text-red-400':'text-slate-400'}`}>{new Date(inv.dueDate).toLocaleDateString()}</span>
                  </td>
                  <td className="px-5 py-3 text-right"><span className="text-white font-semibold text-sm">{inv.currency} {inv.total?.toFixed(2)}</span></td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${STATUS_COLORS[inv.status]||'bg-white/5 text-slate-400'}`}>{inv.status}</span></td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/finance/invoices/${inv._id}`} className="text-slate-400 hover:text-white transition-colors"><FiArrowRight size={14}/></Link>
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
