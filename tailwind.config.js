/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#1e1b4b',
          900: '#0a0f1e',
          950: '#060912',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        brand: {
          primary:   '#0a0f1e',
          secondary: '#1e1b4b',
          accent:    '#2563eb',
          gold:      '#f59e0b',
          light:     '#f8fafc',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up':     'fadeUp 0.6s ease-out forwards',
        'fade-in':     'fadeIn 0.5s ease-out forwards',
        'slide-left':  'slideLeft 0.6s ease-out forwards',
        'slide-right': 'slideRight 0.6s ease-out forwards',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':       'float 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s infinite',
        'count-up':    'countUp 2s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'premium':  '0 25px 50px -12px rgba(0,0,0,0.15), 0 10px 20px -5px rgba(0,0,0,0.08)',
        'glow':     '0 0 30px rgba(37,99,235,0.3)',
        'glow-gold':'0 0 30px rgba(245,158,11,0.3)',
        'card':     '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover':'0 20px 40px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
