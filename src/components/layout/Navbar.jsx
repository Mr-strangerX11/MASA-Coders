'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiArrowRight, FiUser } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home',         href: '/' },
  { label: 'About',        href: '/about' },
  { label: 'Services',     href: '/services' },
  { label: 'Projects',     href: '/projects' },
  { label: 'Offers',       href: '/offers' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Blog',         href: '/blog' },
  { label: 'Contact',      href: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100'
            : 'bg-transparent'
        )}
      >
        <nav className="container-custom flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="MASA Coders"
              width={40}
              height={40}
              className="group-hover:scale-110 transition-transform"
            />
            <span className={cn(
              'font-display font-bold text-xl transition-colors',
              scrolled ? 'text-slate-900' : 'text-white'
            )}>
              MASA <span className="text-blue-500">Coders</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50'
                      : scrolled
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA & Account */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/admin/login"
              className={cn(
                'p-2 rounded-lg transition-colors',
                scrolled
                  ? 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
              title="Admin Login"
            >
              <FiUser className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="btn-primary text-sm px-5 py-2.5"
            >
              Start a Project <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            )}
          >
            {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/98 backdrop-blur-xl border-b border-slate-100 shadow-2xl lg:hidden overflow-hidden"
          >
            <div className="container-custom py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      pathname === link.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <Link href="/admin/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all">
                  <FiUser className="w-4 h-4" />
                  Admin Login
                </Link>
                <Link href="/contact" className="btn-primary w-full justify-center">
                  Start a Project <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
