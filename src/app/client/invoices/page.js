'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiFileText, FiSearch, FiDownload, FiArrowRight, FiDollarSign } from 'react-icons/fi';

function StatusBadge({ status }) {
  const map = {
    draft:    'bg-slate-500/15 text-slate-400',
    sent:     'bg-blue-500/15 text-blue-400',
    viewed:   'bg-purple-500/15 text-purple-400',
    paid:     'bg-emerald-500/15 text-emerald-400',
    overdue:  'bg-red-500/15 text-red-400',
    cancelled:'bg-slate-600/15 text-slate-500',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${map[status] || 'bg-white/5 text-slate-400'}`}>{status}</span>;
}

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    fetch('/api/invoices?limit=100')
      .then(r => r.json())
      .then(d => setInvoices(d.invoices || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || inv.projectId?.title?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || inv.status === filter;
    return matchSearch && matchFilter;
  });

  const totalUnpaid = invoices.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status)).reduce((s, i) => s + i.total, 0);
  const totalPaid   = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Invoices</h1>
        <p className="text-slate-400 text-sm mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Outstanding',  value: `$${totalUnpaid.toFixed(2)}`, color: totalUnpaid > 0 ? 'text-orange-400' : 'text-white' },
          { label: 'Total Paid',   value: `$${totalPaid.toFixed(2)}`,   color: 'text-emerald-400' },
          { label: 'All Invoices', value: invoices.length,              color: 'text-white' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white/3 border border-white/8 rounded-2xl p-5">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-slate-400 text-xs font-medium mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..."
            className="w-full bg-white/3 border border-white/8 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder-slate-600"
          />
        </div>
        <div className="flex gap-2">
          {['all','sent','viewed','paid','overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white/3 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No invoices found.</div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Invoice</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 hidden md:table-cell">Project</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3 hidden lg:table-cell">Due Date</th>
                <th className="text-right text-xs font-medium text-slate-400 px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-400 px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv._id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white text-sm font-medium">{inv.invoiceNumber}</div>
                    <div className="text-slate-500 text-xs">{new Date(inv.issueDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">{inv.projectId?.title || '—'}</span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell">
                    <span className={`text-sm ${inv.status === 'overdue' ? 'text-red-400' : 'text-slate-400'}`}>
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-white font-semibold text-sm">{inv.currency} {inv.total?.toFixed(2)}</span>
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3">
                    <Link href={`/client/invoices/${inv._id}`} className="text-slate-400 hover:text-white transition-colors">
                      <FiArrowRight size={14} />
                    </Link>
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
