'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiTwitter, FiLinkedin, FiInstagram, FiFacebook, FiMail, FiPhone, FiMapPin, FiArrowRight, FiLoader } from 'react-icons/fi';

const quickLinks = [
  { label: 'About Us',     href: '/about' },
  { label: 'Services',     href: '/services' },
  { label: 'Projects',     href: '/projects' },
  { label: 'Offers',       href: '/offers' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog',         href: '/blog' },
  { label: 'Contact',      href: '/contact' },
];

const services = [
  'Web Design & Development',
  'Mobile App Development',
  'UI/UX Design',
  'Digital Marketing',
  'SEO Optimization',
  'Brand Identity',
  'E-commerce Solutions',
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: '' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Thank you for subscribing!');
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.error || data.message || 'Failed to subscribe. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
      console.error('Subscribe error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <footer className="bg-[#060912] text-slate-400 relative overflow-hidden">
      {/* Gradient blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Newsletter bar */}
      <div className="border-b border-white/5">
        <div className="container-custom py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white font-semibold text-lg">Stay in the loop</h3>
            <p className="text-sm text-slate-500 mt-1">Get our latest insights and offers delivered to your inbox.</p>
          </div>
          <div className="w-full md:w-auto">
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                required
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading}
                className="btn-primary px-5 py-2.5 text-sm shrink-0 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <FiLoader className="w-4 h-4 animate-spin" /> : <>Subscribe <FiArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
            {message && (
              <p className={`text-xs mt-2 ${messageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <Image src="/logo.png" alt="MASA Coders" width={40} height={40} />
              <span className="font-display font-bold text-xl text-white">
                MASA <span className="text-blue-500">Coders</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              We transform ideas into powerful digital experiences that drive real business growth.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: FiTwitter,   href: '#', label: 'Twitter' },
                { icon: FiLinkedin,  href: '#', label: 'LinkedIn' },
                { icon: FiInstagram, href: '#', label: 'Instagram' },
                { icon: FiFacebook,  href: '#', label: 'Facebook' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
                >
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200">›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                  >
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-5 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FiMail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <a href="mailto:info@masacoders.tech" className="text-sm text-slate-500 hover:text-white transition-colors">
                  info@masacoders.tech
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiPhone className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <a href="tel:+9779705478032" className="text-sm text-slate-500 hover:text-white transition-colors">
                  +977 9705478032
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-500">
                  kasualtar Madhyapur Thimi - 3<br />Bhaktapur, Nepal (online based)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {year} MASA Coders. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms"   className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="/admin/login" className="hover:text-slate-400 transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
