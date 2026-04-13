'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiCode, FiSmartphone, FiLayout, FiTrendingUp, FiSearch, FiZap } from 'react-icons/fi';
import SectionHeader from '@/components/ui/SectionHeader';

const iconMap = {
  FiCode, FiSmartphone, FiLayout, FiTrendingUp, FiSearch, FiZap,
};

const defaultServices = [
  {
    icon: 'FiLayout',
    title: 'Web Design & Development',
    shortDesc: 'Stunning, conversion-focused websites built with the latest technologies and best practices.',
    color: 'blue',
  },
  {
    icon: 'FiSmartphone',
    title: 'Mobile App Development',
    shortDesc: 'Native and cross-platform mobile applications that deliver exceptional user experiences.',
    color: 'purple',
  },
  {
    icon: 'FiTrendingUp',
    title: 'Digital Marketing',
    shortDesc: 'Data-driven strategies to grow your audience, generate leads, and increase revenue.',
    color: 'green',
  },
  {
    icon: 'FiSearch',
    title: 'SEO Optimization',
    shortDesc: 'Rank higher on search engines and attract organic traffic that converts into customers.',
    color: 'orange',
  },
  {
    icon: 'FiCode',
    title: 'UI/UX Design',
    shortDesc: 'Beautiful interfaces designed with human psychology and conversion optimization in mind.',
    color: 'pink',
  },
  {
    icon: 'FiZap',
    title: 'Performance Optimization',
    shortDesc: 'Lightning-fast digital experiences that keep users engaged and search engines happy.',
    color: 'amber',
  },
];

const colorMap = {
  blue:   'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-500',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20 text-purple-500',
  green:  'from-green-500/20 to-green-600/10 border-green-500/20 text-green-500',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-500',
  pink:   'from-pink-500/20 to-pink-600/10 border-pink-500/20 text-pink-500',
  amber:  'from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-500',
};

export default function FeaturedServices({ services }) {
  const displayServices = (services && services.length > 0) ? services.slice(0, 6) : defaultServices;

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <SectionHeader
          badge="What We Do"
          title={<>Comprehensive Digital <span className="gradient-text">Solutions</span></>}
          subtitle="From concept to launch, we provide end-to-end digital services that transform your vision into reality."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayServices.map((service, i) => {
            const Icon = iconMap[service.icon] || FiZap;
            const colorClass = colorMap[service.color || 'blue'];

            return (
              <motion.div
                key={service._id || service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="group card-premium p-7 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${colorClass.split(' ').find(c => c.startsWith('text-'))}`} />
                </div>
                <h3 className="font-display font-semibold text-slate-900 text-lg mb-2">{service.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">{service.shortDesc || service.description}</p>
                <Link
                  href={service.slug ? `/services#${service.slug}` : '/services'}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all"
                >
                  Learn more <FiArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/services" className="btn-primary">
            Explore All Services <FiArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
