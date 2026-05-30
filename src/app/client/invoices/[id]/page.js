'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiDownload, FiPrinter } from 'react-icons/fi';

function StatusBadge({ status }) {
  const map = { draft:'bg-slate-500/15 text-slate-400', sent:'bg-blue-500/15 text-blue-400', viewed:'bg-purple-500/15 text-purple-400', paid:'bg-emerald-500/15 text-emerald-400', overdue:'bg-red-500/15 text-red-400' };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${map[status] || 'bg-white/5 text-slate-400'}`}>{status}</span>;
}

export default function ClientInvoiceDetailPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then(r => { if (!r.ok) router.push('/client/invoices'); return r.json(); })
      .then(d => { setInvoice(d.invoice); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 w-48 bg-white/5 rounded-xl" /></div>;
  if (!invoice) return null;

  const inv = invoice;

  return (
    <div className="p-8">
      <Link href="/client/invoices" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14} /> Back to invoices
      </Link>

      <div className="max-w-3xl">
        {/* Invoice card */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8" id="invoice-print">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="text-white font-bold text-xl mb-1">{inv.companyName || 'MASA Coders'}</div>
              {inv.companyAddress && <div className="text-slate-400 text-xs">{inv.companyAddress}</div>}
              {inv.companyEmail   && <div className="text-slate-400 text-xs">{inv.companyEmail}</div>}
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">INVOICE</div>
              <div className="text-slate-400 text-sm">#{inv.invoiceNumber}</div>
              <div className="mt-2"><StatusBadge status={inv.status} /></div>
            </div>
          </div>

          {/* Client + dates */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <div className="text-slate-500 text-xs font-medium uppercase mb-2">Bill To</div>
              <div className="text-white font-semibold">{inv.clientId?.name}</div>
              <div className="text-slate-400 text-sm">{inv.clientId?.company}</div>
              <div className="text-slate-400 text-sm">{inv.clientId?.email}</div>
            </div>
            <div className="text-right">
              <div className="space-y-1.5">
                <div className="flex justify-end gap-6 text-sm">
                  <span className="text-slate-500">Issue Date</span>
                  <span className="text-white">{new Date(inv.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-end gap-6 text-sm">
                  <span className="text-slate-500">Due Date</span>
                  <span className={`font-medium ${inv.status === 'overdue' ? 'text-red-400' : 'text-white'}`}>{new Date(inv.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border border-white/8 rounded-xl overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/8">
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Description</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Qty</th>
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Rate</th>
                  {inv.items?.some(i => i.taxRate > 0) && <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Tax</th>}
                  <th className="text-right text-xs font-medium text-slate-400 px-4 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {inv.items?.map((item, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white text-sm">{item.description}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm text-right">{inv.currency} {item.rate.toFixed(2)}</td>
                    {inv.items?.some(i => i.taxRate > 0) && <td className="px-4 py-3 text-slate-400 text-sm text-right">{item.taxRate || 0}%</td>}
                    <td className="px-4 py-3 text-white font-medium text-sm text-right">{inv.currency} {item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-white">{inv.currency} {inv.subtotal?.toFixed(2)}</span>
              </div>
              {inv.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tax</span>
                  <span className="text-white">{inv.currency} {inv.taxTotal?.toFixed(2)}</span>
                </div>
              )}
              {inv.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Discount</span>
                  <span className="text-emerald-400">- {inv.currency} {inv.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-white/15 pt-2">
                <span className="text-white">Total</span>
                <span className="text-white">{inv.currency} {inv.total?.toFixed(2)}</span>
              </div>
              {inv.status === 'paid' && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Paid</span>
                  <span className="text-emerald-400">{inv.currency} {inv.paidAmount?.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {inv.notes && (
            <div className="border-t border-white/8 pt-5">
              <div className="text-slate-500 text-xs font-medium uppercase mb-1">Notes</div>
              <p className="text-slate-400 text-sm">{inv.notes}</p>
            </div>
          )}
          {inv.terms && (
            <div className="mt-3">
              <div className="text-slate-500 text-xs font-medium uppercase mb-1">Terms</div>
              <p className="text-slate-400 text-xs">{inv.terms}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <FiPrinter size={14} /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
