'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiX, FiTag, FiCopy, FiCheck } from 'react-icons/fi';

export default function OfferPopup({ offer }) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!offer) return;
    const dismissed = sessionStorage.getItem(`offer-dismissed-${offer._id}`);
    if (dismissed) return;
    const t = setTimeout(() => setOpen(true), 2500);
    return () => clearTimeout(t);
  }, [offer]);

  if (!offer || !open) return null;

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem(`offer-dismissed-${offer._id}`, '1');
  };

  const copy = () => {
    if (!offer.couponCode) return;
    navigator.clipboard.writeText(offer.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endDate = new Date(offer.endDate);
  const daysLeft = Math.ceil((endDate - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={dismiss} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#0d1424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: offer.color || '#2563eb' }} />

        <div className="p-6">
          <button onClick={dismiss} className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
            <FiX className="w-4 h-4" />
          </button>

          {/* Badge */}
          {offer.badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: `${offer.color}22`, color: offer.color || '#2563eb', border: `1px solid ${offer.color}44` }}>
              <FiTag className="w-3 h-3" />
              {offer.badge}
            </span>
          )}

          {/* Discount */}
          {offer.discount && (
            <div className="text-4xl font-display font-black mb-1" style={{ color: offer.color || '#2563eb' }}>
              {offer.discount}
            </div>
          )}

          <h2 className="text-xl font-display font-bold text-white mb-1">{offer.title}</h2>
          {offer.subtitle && <p className="text-slate-400 text-sm mb-3">{offer.subtitle}</p>}
          <p className="text-slate-500 text-sm mb-4 leading-relaxed">{offer.description}</p>

          {/* Expiry */}
          {daysLeft <= 7 && (
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {daysLeft <= 0 ? 'Expires today!' : `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
            </div>
          )}

          {/* Coupon code */}
          {offer.couponCode && (
            <button onClick={copy} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/8 transition-colors mb-4 group">
              <code className="text-white font-mono font-bold tracking-widest text-sm flex-1 text-left">{offer.couponCode}</code>
              {copied
                ? <FiCheck className="w-4 h-4 text-green-400 shrink-0" />
                : <FiCopy className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 transition-colors" />}
              <span className="text-xs text-slate-500 shrink-0">{copied ? 'Copied!' : 'Copy code'}</span>
            </button>
          )}

          {/* CTA */}
          <Link
            href={offer.ctaLink || '/contact'}
            onClick={dismiss}
            className="flex items-center justify-center w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: offer.color || '#2563eb' }}
          >
            {offer.ctaText || 'Claim Offer'}
          </Link>

          <button onClick={dismiss} className="w-full mt-2 py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors">
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
