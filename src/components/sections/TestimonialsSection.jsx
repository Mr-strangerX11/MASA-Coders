'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiStar } from 'react-icons/fi';
import SectionHeader from '@/components/ui/SectionHeader';
import { getInitials } from '@/lib/utils';

const defaultTestimonials = [
  { _id: '1', name: 'Sarah Mitchell', role: 'CEO', company: 'TechVision Inc.', rating: 5, content: 'MASA Coders transformed our digital presence completely. The new website increased our lead generation by 180% in just 3 months. Absolutely exceptional work.' },
  { _id: '2', name: 'James Rodriguez', role: 'Founder', company: 'StartupHub', rating: 5, content: 'Working with MASA Coders was the best investment we made. Their attention to detail and strategic thinking is unmatched. Our app now has 50k+ happy users.' },
  { _id: '3', name: 'Emily Chen', role: 'Marketing Director', company: 'GrowthCo', rating: 5, content: 'The team at MASA Coders doesn\'t just deliver projects — they deliver results. Our e-commerce conversion rate jumped 65% after their optimization work.' },
  { _id: '4', name: 'Michael Torres', role: 'CTO', company: 'FinanceFlow', rating: 5, content: 'Professional, reliable, and genuinely talented. They took our complex fintech requirements and built something beautiful and functional beyond our expectations.' },
  { _id: '5', name: 'Priya Sharma', role: 'Product Manager', company: 'CloudStack', rating: 5, content: 'I\'ve worked with many agencies, but MASA Coders stands out for their communication, quality, and the real business impact they create.' },
  { _id: '6', name: 'David Park', role: 'CEO', company: 'RetailMax', rating: 5, content: 'Our online sales doubled in 6 months after launching with MASA Coders. The ROI has been incredible. Highly recommend to any serious business.' },
];

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  );
}

export default function TestimonialsSection({ testimonials }) {
  const items = (testimonials && testimonials.length > 0) ? testimonials : defaultTestimonials;

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <SectionHeader
          badge="Client Love"
          title={<>What Our Clients <span className="gradient-text">Say About Us</span></>}
          subtitle="Real results from real clients. Don't take our word for it — hear from the businesses we've helped grow."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.slice(0, 6).map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-premium p-7 flex flex-col"
            >
              <StarRating rating={t.rating} />
              <blockquote className="mt-4 text-slate-600 text-sm leading-relaxed flex-1">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-100">
                {t.avatar ? (
                  <Image src={t.avatar} alt={t.name} width={40} height={40} className="rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(t.name)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}{t.company ? `, ${t.company}` : ''}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
