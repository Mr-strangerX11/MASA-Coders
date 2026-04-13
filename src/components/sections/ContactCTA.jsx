'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiMessageCircle } from 'react-icons/fi';

export default function ContactCTA() {
  return (
    <section className="section bg-[#060912] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-indigo-600/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="container-custom relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Ready to start? Let's talk
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
            Ready to <span className="gradient-text">Transform</span> Your Digital Presence?
          </h2>

          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            Let's discuss your project and create something extraordinary together. Free consultation, no commitment required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="btn-primary px-8 py-4 text-base">
              Start a Free Consultation <FiArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://wa.me/9779705478032"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white/80 border border-white/15 hover:border-green-500/50 hover:text-green-400 transition-all duration-300"
            >
              <FiMessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
            {['Response within 24 hours', 'No obligations', 'Expert advice free'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                </span>
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
