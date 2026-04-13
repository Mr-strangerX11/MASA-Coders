'use client';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';

const steps = [
  { num: '01', title: 'Discovery & Strategy', desc: 'We deep-dive into your business, goals, and target audience to craft a tailored digital strategy.' },
  { num: '02', title: 'Design & Prototype',   desc: 'Our designers create stunning visual concepts and interactive prototypes for your approval.' },
  { num: '03', title: 'Development',          desc: 'Our engineers build your solution using modern tech, clean code, and best practices.' },
  { num: '04', title: 'Testing & Launch',     desc: 'Rigorous QA testing followed by a smooth, monitored launch and deployment.' },
  { num: '05', title: 'Growth & Support',     desc: 'Ongoing optimization, analytics, and support to ensure continuous growth and success.' },
];

export default function Process() {
  return (
    <section className="section bg-slate-50">
      <div className="container-custom">
        <SectionHeader
          badge="Our Process"
          title={<>How We <span className="gradient-text">Work With You</span></>}
          subtitle="A proven, streamlined process designed to deliver outstanding results on time, every time."
        />

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-[calc(10%+24px)] right-[calc(10%+24px)] h-0.5 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-purple-500/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5 z-10">
                  <span className="text-white font-bold text-sm">{step.num}</span>
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-sm mb-2">{step.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
