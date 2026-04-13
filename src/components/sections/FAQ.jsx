'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';
import SectionHeader from '@/components/ui/SectionHeader';

const faqs = [
  { q: 'How long does it take to build a website?', a: 'Project timelines vary based on complexity. A typical website takes 4-8 weeks, while complex web applications may take 3-6 months. We provide detailed timelines during our initial consultation.' },
  { q: 'What is your pricing structure?', a: 'Our pricing depends on project scope and requirements. We offer transparent, fixed-price quotes after understanding your needs. Projects typically range from Rs. 25,000 for simple sites to Rs. 5,00,000+ for complex applications.' },
  { q: 'Do you provide ongoing support after launch?', a: 'Absolutely! We offer various maintenance and support packages to keep your digital products running smoothly, updated, and optimized. We\'re your long-term digital partner.' },
  { q: 'Can I update my website content myself?', a: 'Yes! We build user-friendly admin dashboards that allow you to update content, add projects, manage offers, and control every aspect of your website without technical knowledge.' },
  { q: 'Do you work with clients globally?', a: 'Yes! We work with clients worldwide. With modern collaboration tools, geographic location is never a barrier. We\'ve successfully delivered projects for clients across 20+ countries.' },
  { q: 'What technologies do you use?', a: 'We use cutting-edge technologies including Next.js, React, Node.js, MongoDB, PostgreSQL, Tailwind CSS, and more. We choose the right tech stack based on your project requirements.' },
  { q: 'Is my website going to be mobile-friendly?', a: 'Every project we build is fully responsive and mobile-first. We design and test across all devices and screen sizes to ensure a flawless experience everywhere.' },
];

function FAQItem({ q, a, isOpen, onClick }) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900 text-base">{q}</span>
        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          {isOpen ? <FiMinus className="w-4 h-4 text-blue-600" /> : <FiPlus className="w-4 h-4 text-slate-500" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <SectionHeader
          badge="FAQ"
          title={<>Frequently Asked <span className="gradient-text">Questions</span></>}
          subtitle="Everything you need to know before we start working together."
        />
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
