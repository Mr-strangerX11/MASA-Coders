export const dynamic = 'force-dynamic';

import { FiArrowRight, FiCode, FiSmartphone, FiLayout, FiTrendingUp, FiSearch, FiZap, FiShoppingCart, FiBriefcase } from 'react-icons/fi';
import Link from 'next/link';
import ContactCTA from '@/components/sections/ContactCTA';
import connectDB from '@/lib/mongodb';
import Service from '@/models/Service';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = { title: 'Services' };

const iconMap = { FiCode, FiSmartphone, FiLayout, FiTrendingUp, FiSearch, FiZap, FiShoppingCart, FiBriefcase };

const defaultServices = [
  {
    icon: 'FiLayout',
    title: 'Web Design & Development',
    description: 'We create stunning, conversion-focused websites that not only look beautiful but are engineered to drive business results.',
    features: ['Custom design from scratch', 'Mobile-first approach', 'SEO-optimized structure', 'Admin dashboard', 'Lightning-fast performance', 'Cross-browser compatibility'],
    price: 'Starting at Rs. 49,999',
    duration: '4-8 weeks',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    icon: 'FiSmartphone',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications built for performance, with exceptional user experiences on iOS and Android.',
    features: ['iOS & Android', 'React Native / Flutter', 'API integration', 'Push notifications', 'Offline support', 'App Store submission'],
    price: 'Starting at Rs. 1,49,999',
    duration: '8-16 weeks',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    icon: 'FiShoppingCart',
    title: 'E-commerce Solutions',
    description: 'Complete online store solutions with advanced inventory management, payment gateways, and conversion optimization.',
    features: ['Custom storefront', 'Payment integration', 'Inventory management', 'Order tracking', 'Multi-currency support', 'Analytics dashboard'],
    price: 'Starting at Rs. 79,999',
    duration: '6-10 weeks',
    color: 'green',
    gradient: 'from-green-500 to-teal-600',
  },
  {
    icon: 'FiTrendingUp',
    title: 'Digital Marketing',
    description: 'Data-driven digital marketing strategies that attract your ideal customers, grow your audience, and increase revenue.',
    features: ['Social media marketing', 'PPC advertising', 'Content strategy', 'Email campaigns', 'Analytics & reporting', 'Conversion optimization'],
    price: 'Starting at Rs. 24,999/mo',
    duration: 'Ongoing',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    icon: 'FiSearch',
    title: 'SEO Optimization',
    description: 'Comprehensive SEO strategies that boost your search rankings, drive organic traffic, and generate qualified leads.',
    features: ['Technical SEO audit', 'On-page optimization', 'Link building', 'Local SEO', 'Content optimization', 'Monthly reporting'],
    price: 'Starting at Rs. 14,999/mo',
    duration: 'Ongoing',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    icon: 'FiBriefcase',
    title: 'Brand Identity Design',
    description: 'Complete brand identity systems that communicate your values, differentiate you from competitors, and build trust.',
    features: ['Logo design', 'Brand guidelines', 'Color palette', 'Typography system', 'Business collateral', 'Social media kit'],
    price: 'Starting at Rs. 34,999',
    duration: '2-4 weeks',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-600',
  },
];

const colorBg = {
  blue: 'bg-blue-50 border-blue-200',
  purple: 'bg-purple-50 border-purple-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
  teal: 'bg-teal-50 border-teal-200',
  pink: 'bg-pink-50 border-pink-200',
};

async function getServices() {
  try {
    await connectDB();
    return await Service.find({ isVisible: true })
      .sort({ isFeatured: -1, order: 1 })
      .lean();
  } catch { return []; }
}

export default async function ServicesPage() {
  const dbServices = await getServices();
  const services = dbServices.length > 0 ? dbServices : defaultServices;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            What We Offer
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Services That <span className="gradient-text">Drive Results</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            End-to-end digital solutions crafted to grow your business and exceed your goals.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || FiZap;
              const features = service.features || [];

              return (
                <div key={service._id || service.title} id={service.slug || undefined} className="card-premium p-7 flex flex-col">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient || 'from-blue-500 to-indigo-600'} flex items-center justify-center mb-5 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-5 flex-1">{service.description}</p>

                  {features.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="border-t border-slate-100 pt-5 mt-auto">
                    <div className="flex items-center justify-between mb-4 text-sm">
                      {service.price && <span className="font-semibold text-slate-900">{service.price}</span>}
                      {service.duration && <span className="text-slate-400">{service.duration}</span>}
                    </div>
                    <Link href="/contact" className="btn-primary w-full justify-center">
                      Get Started <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
