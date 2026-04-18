'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiTag, FiArrowRight } from 'react-icons/fi';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { formatDate } from '@/lib/utils';

export default function OffersGrid({ offers }) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">No Active Offers Right Now</h2>
        <p className="text-slate-500 mb-8">Check back soon for exclusive deals and promotions.</p>
        <Link href="/contact" className="btn-primary">Contact Us for Custom Pricing</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {offers.map((offer) => (
        <div key={offer._id} className="card-premium overflow-hidden">
          {/* Accent top */}
          <div className="h-1.5" style={{ backgroundColor: offer.color || '#2563eb' }} />

          {/* Banner image */}
          {offer.bannerImage && (
            <div className="relative h-40 overflow-hidden">
              <Image src={offer.bannerImage} alt={offer.title} fill className="object-cover" />
            </div>
          )}

          <div className="p-7">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {offer.badge && (
                  <span className="badge bg-amber-50 text-amber-700 border border-amber-200 mb-2 block w-fit text-xs">
                    🔥 {offer.badge}
                  </span>
                )}
                <h2 className="font-display font-bold text-2xl text-slate-900">{offer.title}</h2>
                {offer.subtitle && <p className="text-slate-500 text-sm mt-1">{offer.subtitle}</p>}
              </div>
              {offer.discount && (
                <div
                  className="text-3xl font-display font-black px-4 py-2 rounded-xl shrink-0"
                  style={{ color: offer.color || '#2563eb', backgroundColor: `${offer.color || '#2563eb'}15` }}
                >
                  {offer.discount}
                </div>
              )}
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">{offer.description}</p>

            {/* Countdown */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5" />
                Expires {formatDate(offer.endDate)}
              </p>
              <CountdownTimer endDate={offer.endDate} />
            </div>

            {/* Coupon */}
            {offer.couponCode && (
              <div className="flex items-center gap-3 mb-5 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FiTag className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-sm text-slate-500">Use code:</span>
                <code className="font-mono font-bold text-slate-900 tracking-wider text-sm">{offer.couponCode}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(offer.couponCode)}
                  className="ml-auto text-xs text-blue-600 hover:underline"
                >
                  Copy
                </button>
              </div>
            )}

            <Link
              href={offer.ctaLink || '/contact'}
              className="btn-primary w-full justify-center"
              style={{ background: `linear-gradient(135deg, ${offer.color || '#2563eb'}, ${offer.color || '#4f46e5'})` }}
            >
              {offer.ctaText || 'Claim Offer'} <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
