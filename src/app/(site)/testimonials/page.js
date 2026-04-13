export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { FiStar } from 'react-icons/fi';
import ContactCTA from '@/components/sections/ContactCTA';
import { getInitials } from '@/lib/utils';
import connectDB from '@/lib/mongodb';
import Testimonial from '@/models/Testimonial';

export const metadata = { title: 'Testimonials' };

async function getTestimonials() {
  try {
    await connectDB();
    return await Testimonial.find({ isPublished: true })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
  } catch { return []; }
}

const defaults = [
  { _id: '1', name: 'Sarah Mitchell',  role: 'CEO',                company: 'TechVision Inc.',  rating: 5, content: 'MASA Coders transformed our digital presence completely. The new website increased our lead generation by 180% in just 3 months. Absolutely exceptional work that exceeded every expectation.', project: 'Website Redesign' },
  { _id: '2', name: 'James Rodriguez', role: 'Founder',            company: 'StartupHub',       rating: 5, content: 'Working with MASA Coders was the best investment we made. Their attention to detail and strategic thinking is unmatched. Our app now has 50k+ happy users and 4.9 stars on both stores.' },
  { _id: '3', name: 'Emily Chen',      role: 'Marketing Director', company: 'GrowthCo',         rating: 5, content: 'The team at MASA Coders doesn\'t just deliver projects — they deliver results. Our e-commerce conversion rate jumped 65% after their optimization work. Worth every penny.', project: 'E-commerce Optimization' },
  { _id: '4', name: 'Michael Torres',  role: 'CTO',                company: 'FinanceFlow',      rating: 5, content: 'Professional, reliable, and genuinely talented. They took our complex fintech requirements and built something beautiful and functional beyond our expectations.' },
  { _id: '5', name: 'Priya Sharma',    role: 'Product Manager',    company: 'CloudStack',       rating: 5, content: 'I\'ve worked with many agencies, but MASA Coders stands out for their communication, quality, and the real business impact they create. They truly care about your success.' },
  { _id: '6', name: 'David Park',      role: 'CEO',                company: 'RetailMax',        rating: 5, content: 'Our online sales doubled in 6 months after launching with MASA Coders. The ROI has been incredible. Highly recommend to any serious business looking for a premium digital partner.' },
  { _id: '7', name: 'Anna Williams',   role: 'Director',           company: 'HealthFirst',      rating: 5, content: 'The MASA Coders team delivered our healthcare platform on time and within budget. The quality of work is outstanding and the post-launch support has been fantastic.' },
  { _id: '8', name: 'Robert Kim',      role: 'Founder',            company: 'EduTech Co.',      rating: 5, content: 'MASA Coders built our entire e-learning platform from scratch. The attention to UX detail resulted in 90% student completion rates — up from 40% with our old platform.' },
  { _id: '9', name: 'Lisa Thompson',   role: 'CMO',                company: 'BrandPulse',       rating: 5, content: 'Their brand identity work completely transformed how we\'re perceived in the market. We\'ve been featured in 3 major publications since the rebrand. Incredible ROI.' },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <FiStar key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const dbTestimonials = await getTestimonials();
  const testimonials = dbTestimonials.length > 0 ? dbTestimonials : defaults;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-300 text-xs font-semibold mb-6">
            ⭐ Client Reviews
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            What Our Clients <span className="gradient-text">Love About Us</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Real words from real clients who trusted us to transform their digital presence.
          </p>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8">
            {[['5.0★', 'Average Rating'], ['100%', 'Satisfaction Rate'], ['150+', 'Happy Clients']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-display font-bold gradient-text">{v}</div>
                <div className="text-sm text-slate-500 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={t._id} className="card-premium p-7 flex flex-col">
                <StarRating rating={t.rating} />
                {t.project && (
                  <span className="mt-2 text-xs text-blue-600 font-medium">{t.project}</span>
                )}
                <blockquote className="mt-4 text-slate-600 text-sm leading-relaxed flex-1">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                  {t.avatar ? (
                    <Image src={t.avatar} alt={t.name} width={44} height={44} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {getInitials(t.name)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}{t.company ? `, ${t.company}` : ''}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
