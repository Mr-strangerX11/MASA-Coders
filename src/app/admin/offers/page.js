'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { formatDate } from '@/lib/utils';

export default function AdminOffersPage() {
  const [offers, setOffers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(null);  // null = list, object = create/edit

  const fetchOffers = async () => {
    const res = await fetch('/api/offers?admin=true');
    const data = await res.json();
    setOffers(data.offers || []);
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, []);

  const toggleActive = async (id, isActive) => {
    await fetch(`/api/offers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive }) });
    toast.success(`Offer ${isActive ? 'deactivated' : 'activated'}`);
    fetchOffers();
  };

  const deleteOffer = async (id) => {
    if (!confirm('Delete this offer?')) return;
    await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    toast.success('Offer deleted');
    fetchOffers();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = form._id ? 'PUT' : 'POST';
    const url    = form._id ? `/api/offers/${form._id}` : '/api/offers';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { toast.success(form._id ? 'Offer updated' : 'Offer created'); setForm(null); fetchOffers(); }
    else toast.error('Failed to save offer');
  };

  const blankForm = {
    title: '', subtitle: '', description: '', discount: '', badge: '', couponCode: '',
    ctaText: 'Claim Offer', ctaLink: '/contact', color: '#2563eb',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    isActive: true, isFeatured: false, showPopup: false,
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 transition-colors';
  const labelClass = 'block text-xs font-medium text-slate-400 mb-1';

  if (form !== null) {
    return (
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => setForm(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-slate-400">← Back</button>
          <h1 className="text-xl font-display font-bold text-white">{form._id ? 'Edit Offer' : 'New Offer'}</h1>
        </div>
        <form onSubmit={handleSave} className="bg-white/5 border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} /></div>
            <div><label className={labelClass}>Discount Label</label><input type="text" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="30% OFF" className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Subtitle</label><input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Badge</label><input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Limited Time" className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Description *</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className={`${inputClass} resize-none`} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Coupon Code</label><input type="text" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Accent Color</label><input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-full rounded-xl cursor-pointer bg-transparent" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>CTA Text</label><input type="text" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>CTA Link</label><input type="text" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Start Date *</label><input type="date" value={form.startDate?.split('T')[0] || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required className={inputClass} /></div>
            <div><label className={labelClass}>End Date *</label><input type="date" value={form.endDate?.split('T')[0] || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required className={inputClass} /></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-600" /><span className="text-slate-300 text-sm">Active</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-blue-600" /><span className="text-slate-300 text-sm">Featured on Homepage</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.showPopup} onChange={(e) => setForm({ ...form, showPopup: e.target.checked })} className="accent-blue-600" /><span className="text-slate-300 text-sm">Show Popup</span></label>
          </div>
          <div className="flex gap-4 pt-2">
            <button type="submit" className="btn-primary">Save Offer</button>
            <button type="button" onClick={() => setForm(null)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Offers</h1>
          <p className="text-slate-500 text-sm mt-1">Manage promotions and special deals</p>
        </div>
        <button onClick={() => setForm(blankForm)} className="btn-primary"><FiPlus className="w-4 h-4" /> New Offer</button>
      </div>

      {loading ? <div className="text-slate-500 text-center py-20">Loading...</div> : (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/8">
              <p className="text-slate-400 mb-4">No offers yet</p>
              <button onClick={() => setForm(blankForm)} className="btn-primary"><FiPlus className="w-4 h-4" /> Create First Offer</button>
            </div>
          ) : offers.map((offer) => {
            const now = new Date();
            const expired = new Date(offer.endDate) < now;
            const active  = offer.isActive && !expired;
            return (
              <div key={offer._id} className="bg-white/5 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-3 h-12 rounded-full shrink-0" style={{ backgroundColor: offer.color || '#2563eb' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{offer.title}</h3>
                    {offer.discount && <span className="badge bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs">{offer.discount}</span>}
                    {offer.isFeatured && <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">Featured</span>}
                    {expired ? <span className="badge bg-red-500/20 text-red-400 border border-red-500/30 text-xs">Expired</span>
                      : active ? <span className="badge bg-green-500/20 text-green-400 border border-green-500/30 text-xs">Active</span>
                      : <span className="badge bg-slate-500/20 text-slate-400 border border-slate-500/30 text-xs">Inactive</span>}
                  </div>
                  <p className="text-slate-500 text-xs">
                    {formatDate(offer.startDate, { month: 'short', day: 'numeric' })} — {formatDate(offer.endDate, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(offer._id, offer.isActive)} className={`p-1.5 rounded-lg transition-colors ${offer.isActive ? 'text-green-400 bg-green-400/10' : 'text-slate-500 hover:text-green-400 hover:bg-green-400/10'}`}>
                    {offer.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setForm({ ...offer, startDate: offer.startDate?.split('T')[0], endDate: offer.endDate?.split('T')[0] })} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteOffer(offer._id)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
