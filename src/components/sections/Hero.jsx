'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiPlay } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const stats = [
  { value: '15+', label: 'Projects Delivered' },
  { value: '4+',  label: 'Happy Clients' },
  { value: '2+',   label: 'Years Experience' },
  { value: '7+',  label: 'Team Members' },
];

export default function Hero({
  headline   = 'We Build Digital Products That Drive Real Growth',
  subheadline = 'Premium web design, development, and digital strategy solutions tailored for ambitious businesses ready to scale.',
  cta1Text = 'Start Your Project',
  cta1Link = '/contact',
  cta2Text = 'View Our Work',
  cta2Link = '/projects',
}) {
  return (
    <section className="relative min-h-screen bg-[#060912] flex flex-col justify-center overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container-custom relative z-10 pt-32 pb-20">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-300 font-medium">
              <HiSparkles className="w-4 h-4 text-blue-400" />
              Premium Digital Agency
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight"
          >
            {headline.split(' ').map((word, i, arr) => {
              const accentWords = ['Digital', 'Real', 'Drive', 'Growth'];
              return (
                <span
                  key={i}
                  className={accentWords.includes(word) ? 'gradient-text' : ''}
                >
                  {word}{i < arr.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 text-center text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            {subheadline}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={cta1Link} className="btn-primary px-8 py-4 text-base">
              {cta1Text} <FiArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={cta2Link}
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white/80 border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <FiPlay className="w-3.5 h-3.5 ml-0.5" />
              </span>
              {cta2Text}
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-500"
          >
            {['No hidden fees', 'Free consultation', '100% satisfaction guarantee', 'On-time delivery'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="text-center px-4 py-6 rounded-2xl bg-white/4 border border-white/8 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="text-3xl font-display font-bold gradient-text">{value}</div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-600 uppercase tracking-widest">Scroll</span>
        <div className="w-5 h-9 rounded-full border border-white/20 flex items-start justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 h-2 rounded-full bg-blue-500"
          />
        </div>
      </motion.div>
    </section>
  );
}
