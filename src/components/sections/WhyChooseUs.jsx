'use client';
import { motion } from 'framer-motion';
import { FiAward, FiClock, FiUsers, FiTrendingUp, FiShield, FiStar } from 'react-icons/fi';
import SectionHeader from '@/components/ui/SectionHeader';

const reasons = [
  { icon: FiAward,     title: 'Premium Quality',       desc: 'Every project is crafted with meticulous attention to detail, ensuring pixel-perfect execution and outstanding results.' },
  { icon: FiClock,     title: 'On-Time Delivery',      desc: 'We respect your timeline. Projects are delivered on schedule without compromising quality or attention to detail.' },
  { icon: FiUsers,     title: 'Dedicated Team',         desc: 'Your project gets a dedicated team of experts who are fully committed to understanding and achieving your goals.' },
  { icon: FiTrendingUp,title: 'Results-Driven',         desc: 'We measure success by your success. Every decision is backed by data and focused on driving real business outcomes.' },
  { icon: FiShield,    title: 'Secure & Reliable',     desc: 'Built with industry-best security practices, your digital assets are always protected and future-proof.' },
  { icon: FiStar,      title: '5-Star Support',         desc: 'Our relationship doesn\'t end at launch. We provide ongoing support and maintenance to keep you ahead.' },
];

export default function WhyChooseUs() {
  return (
    <section className="section bg-[#060912] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[80px]" />
      </div>

      <div className="container-custom relative">
        <SectionHeader
          badge="Why MASA Coders"
          title={<>The Difference That <span className="gradient-text">Matters</span></>}
          subtitle="We don't just build websites. We build digital experiences that transform businesses and create lasting impact."
          dark
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-7 rounded-2xl bg-white/4 border border-white/8 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                <Icon className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
