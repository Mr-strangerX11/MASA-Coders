'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const emptyItem = { description:'', quantity:1, rate:0, taxRate:0 };

export default function CreateInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({
    clientId:'', projectId:'', dueDate:'', currency:'USD', discount:0, notes:'', terms:'Payment due within 30 days.',
  });
  const [items, setItems] = useState([{ ...emptyItem }]);

  useEffect(() => {
    // Load clients via staff-management endpoint (all users) - fetch /api/client/auth would need a list endpoint
    // We'll use a simple approach - fetch all users with role=client
    fetch('/api/staff-management?role=client').catch(()=>{});
    fetch('/api/work-projects?limit=50').then(r=>r.json()).then(d=>setProjects(d.projects||[]));
  }, []);

  function update(f) { return e => setForm(p=>({...p,[f]:e.target.value})); }
  function updateItem(i,f,v) { setItems(prev=>prev.map((item,idx)=>idx===i?{...item,[f]:v}:item)); }
  function addItem() { setItems(prev=>[...prev,{...emptyItem}]); }
  function removeItem(i) { setItems(prev=>prev.filter((_,idx)=>idx!==i)); }

  const subtotal = items.reduce((s,i)=>s+(i.quantity*i.rate),0);
  const taxTotal = items.reduce((s,i)=>s+(i.quantity*i.rate*(i.taxRate||0)/100),0);
  const total    = subtotal + taxTotal - (parseFloat(form.discount)||0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientId) { toast.error('Client is required.'); return; }
    if (!form.dueDate)  { toast.error('Due date is required.'); return; }
    if (items.every(i=>!i.description)) { toast.error('Add at least one item.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/invoices', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, discount:parseFloat(form.discount)||0, items }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Invoice created!');
      router.push(`/admin/finance/invoices/${data.invoice._id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/admin/finance" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors w-fit">
        <FiArrowLeft size={14}/> Back to Finance
      </Link>
      <h1 className="text-2xl font-bold text-white mb-8">Create Invoice</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-medium text-sm">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Client *</label>
              <input value={form.clientId} onChange={update('clientId')} placeholder="Client User ID"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
              />
              <p className="text-slate-600 text-xs mt-1">Paste the client&apos;s user ID from Staff/Client management.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Project (optional)</label>
              <select value={form.projectId} onChange={update('projectId')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                <option value="">No project</option>
                {projects.map(p=><option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date *</label>
              <input type="date" required value={form.dueDate} onChange={update('dueDate')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Currency</label>
              <select value={form.currency} onChange={update('currency')} className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                {['USD','EUR','GBP','NPR','INR','AUD'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Discount ({form.currency})</label>
              <input type="number" min="0" step="0.01" value={form.discount} onChange={update('discount')} placeholder="0"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium text-sm">Line Items</h2>
            <button type="button" onClick={addItem} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <FiPlus size={13}/> Add item
            </button>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs text-slate-500 px-1">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Qty</div>
              <div className="col-span-2 text-right">Rate</div>
              <div className="col-span-2 text-right">Tax %</div>
              <div className="col-span-1"></div>
            </div>
            {items.map((item,i)=>(
              <div key={i} className="grid grid-cols-12 gap-2">
                <div className="col-span-5">
                  <input value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} placeholder="Service description"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600"
                  />
                </div>
                <div className="col-span-2">
                  <input type="number" min="1" value={item.quantity} onChange={e=>updateItem(i,'quantity',+e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none text-right"
                  />
                </div>
                <div className="col-span-2">
                  <input type="number" min="0" step="0.01" value={item.rate} onChange={e=>updateItem(i,'rate',+e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none text-right"
                  />
                </div>
                <div className="col-span-2">
                  <input type="number" min="0" max="100" value={item.taxRate} onChange={e=>updateItem(i,'taxRate',+e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2 text-sm focus:outline-none text-right"
                  />
                </div>
                <div className="col-span-1 flex items-center justify-center">
                  <button type="button" onClick={()=>removeItem(i)} disabled={items.length===1} className="text-slate-600 hover:text-red-400 transition-colors disabled:opacity-30">
                    <FiTrash2 size={13}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-48 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="text-white">{form.currency} {subtotal.toFixed(2)}</span></div>
              {taxTotal > 0 && <div className="flex justify-between"><span className="text-slate-400">Tax</span><span className="text-white">{form.currency} {taxTotal.toFixed(2)}</span></div>}
              {parseFloat(form.discount) > 0 && <div className="flex justify-between"><span className="text-slate-400">Discount</span><span className="text-emerald-400">- {form.currency} {parseFloat(form.discount).toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold border-t border-white/15 pt-1.5">
                <span className="text-white">Total</span>
                <span className="text-white">{form.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-medium text-sm">Notes & Terms</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
            <textarea rows={2} value={form.notes} onChange={update('notes')} placeholder="Additional notes for the client..."
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 placeholder-slate-600 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Payment Terms</label>
            <textarea rows={2} value={form.terms} onChange={update('terms')}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500/50 resize-none"
            />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl font-medium transition-colors"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><FiSave size={15}/>Save Invoice</>}
        </button>
      </form>
    </div>
  );
}
