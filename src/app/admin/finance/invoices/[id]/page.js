'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSend, FiCheck, FiPrinter } from 'react-icons/fi';

const STATUS_COLORS = { draft:'bg-slate-500/15 text-slate-400', sent:'bg-blue-500/15 text-blue-400', viewed:'bg-purple-500/15 text-purple-400', paid:'bg-emerald-500/15 text-emerald-400', overdue:'bg-red-500/15 text-red-400' };

export default function AdminInvoiceDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then(r=>{ if(!r.ok)router.push('/admin/finance'); return r.json(); }).then(d=>{ setInvoice(d.invoice); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(status, extra={}) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setInvoice(data.invoice);
      toast.success(`Invoice marked as ${status}`);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl"/></div>;
  if (!invoice) return null;

  const inv = invoice;

  return (
    <div className="p-8">
      <Link href="/admin/finance" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14}/> Finance
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{inv.invoiceNumber}</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${STATUS_COLORS[inv.status]||'bg-white/5 text-slate-400'}`}>{inv.status}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {inv.status === 'draft' && (
            <button onClick={() => updateStatus('sent')} disabled={updating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors">
              <FiSend size={13}/> Send to Client
            </button>
          )}
          {['sent','viewed','overdue'].includes(inv.status) && (
            <button onClick={() => updateStatus('paid', { paidAt: new Date(), paidAmount: inv.total, paymentMethod: 'bank_transfer' })} disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <FiCheck size={13}/> Mark as Paid
            </button>
          )}
          <button onClick={()=>window.print()} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-300 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <FiPrinter size={13}/> Print
          </button>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="text-white font-bold text-xl">{inv.companyName||'MASA Coders'}</div>
              {inv.companyAddress && <div className="text-slate-400 text-xs mt-1">{inv.companyAddress}</div>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">INVOICE</div>
              <div className="text-slate-400 text-sm">#{inv.invoiceNumber}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-slate-500 text-xs uppercase mb-2">Bill To</div>
              <div className="text-white font-semibold">{inv.clientId?.name}</div>
              <div className="text-slate-400 text-sm">{inv.clientId?.company}</div>
              <div className="text-slate-400 text-sm">{inv.clientId?.email}</div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex justify-end gap-8 text-sm">
                <span className="text-slate-500">Issued</span>
                <span className="text-white">{new Date(inv.issueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-end gap-8 text-sm">
                <span className="text-slate-500">Due</span>
                <span className={`font-medium ${inv.status==='overdue'?'text-red-400':'text-white'}`}>{new Date(inv.dueDate).toLocaleDateString()}</span>
              </div>
              {inv.paidAt && <div className="flex justify-end gap-8 text-sm"><span className="text-slate-500">Paid</span><span className="text-emerald-400">{new Date(inv.paidAt).toLocaleDateString()}</span></div>}
            </div>
          </div>
          <div className="border border-white/8 rounded-xl overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/8">
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Description</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Qty</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Rate</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items?.map((item,i)=>(
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white text-sm">{item.description}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm text-right">{inv.currency} {item.rate?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-white font-medium text-sm text-right">{inv.currency} {item.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mb-6">
            <div className="w-56 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="text-white">{inv.currency} {inv.subtotal?.toFixed(2)}</span></div>
              {inv.taxTotal>0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Tax</span><span className="text-white">{inv.currency} {inv.taxTotal?.toFixed(2)}</span></div>}
              {inv.discount>0 && <div className="flex justify-between text-sm"><span className="text-slate-400">Discount</span><span className="text-emerald-400">- {inv.currency} {inv.discount?.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold border-t border-white/15 pt-2 text-base">
                <span className="text-white">Total</span>
                <span className="text-white">{inv.currency} {inv.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {inv.notes && <div className="border-t border-white/8 pt-4"><div className="text-slate-500 text-xs uppercase mb-1">Notes</div><p className="text-slate-400 text-sm">{inv.notes}</p></div>}
        </div>
      </div>
    </div>
  );
}
