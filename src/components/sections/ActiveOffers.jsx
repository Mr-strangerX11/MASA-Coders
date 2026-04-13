'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiClock, FiTag, FiArrowRight } from 'react-icons/fi';
import SectionHeader from '@/components/ui/SectionHeader';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { formatDate } from '@/lib/utils';

const demoOffers = [
  {
    _id: '1',
    title: 'Launch Special',
    subtitle: 'New Business Package',
    description: 'Get a complete business website with admin dashboard, CMS, and 3 months of support at a special introductory price.',
    discount: '40% OFF',
    badge: 'Limited Time',
    couponCode: 'LAUNCH40',
    ctaText: 'Claim This Offer',
    ctaLink: '/contact',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#2563eb',
  },
  {
    _id: '2',
    title: 'Free SEO Audit',
    subtitle: 'For New Clients',
    description: 'Book any web development project and receive a comprehensive 20-point SEO audit worth Rs. 50,000 absolutely free.',
    discount: 'FREE AUDIT',
    badge: 'New Clients',
    couponCode: '',
    ctaText: 'Book Now',
    ctaLink: '/contact',
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    color: '#7c3aed',
  },
];

export default function ActiveOffers({ offers }) {
  const items = (offers && offers.length > 0) ? offers : demoOffers;
  if (items.length === 0) return null;

  return (
    <section className="section bg-slate-50">
      <div className="container-custom">
        <SectionHeader
          badge="Special Offers"
          title={<>Exclusive Deals <span className="gradient-text">Just For You</span></>}
          subtitle="Limited-time offers designed to give your business the best possible start."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {items.slice(0, 4).map((offer, i) => (
            <motion.div
              key={offer._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative group bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 hover:shadow-card-hover transition-all duration-300"
            >
              {/* Accent bar */}
              <div className="h-1 w-full" style={{ backgroundColor: offer.color || '#2563eb' }} />

              <div className="p-7">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    {offer.badge && (
                      <span className="badge bg-amber-50 text-amber-700 border border-amber-200 mb-2 block w-fit text-xs">
                        🔥 {offer.badge}
                      </span>
                    )}
                    <h3 className="font-display font-bold text-xl text-slate-900">{offer.title}</h3>
                    {offer.subtitle && <p className="text-slate-500 text-sm mt-0.5">{offer.subtitle}</p>}
                  </div>
                  <div
                    className="text-2xl font-display font-black px-4 py-2 rounded-xl shrink-0"
                    style={{ color: offer.color || '#2563eb', backgroundColor: `${offer.color || '#2563eb'}15` }}
                  >
                    {offer.discount}
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-5">{offer.description}</p>

                {/* Countdown */}
                <div className="mb-5">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5" />
                    Offer ends {formatDate(offer.endDate)}
                  </p>
                  <CountdownTimer endDate={offer.endDate} />
                </div>

                {/* Coupon code */}
                {offer.couponCode && (
                  <div className="mb-5 flex items-center gap-2">
                    <FiTag className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Use code:</span>
                    <code className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-sm font-mono font-bold tracking-wider border border-dashed border-slate-300">
                      {offer.couponCode}
                    </code>
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
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link href="/offers" className="btn-secondary">
            View All Offers <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
