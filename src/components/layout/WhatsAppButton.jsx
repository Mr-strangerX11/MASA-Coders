'use client';
import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppButton({ phone = '+9779705478032' }) {
  const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hello%20MASA%20Coders!%20I%20would%20like%20to%20discuss%20a%20project.`;
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-green-500/40 flex items-center justify-center"
    >
      <FaWhatsapp className="w-7 h-7 text-white" />
      {/* Ping animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
    </motion.a>
  );
}
