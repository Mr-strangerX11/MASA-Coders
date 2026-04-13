import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'MASA Coders — Premium Digital Agency',
    template: '%s | MASA Coders',
  },
  description: 'MASA Coders builds premium websites, applications, and digital experiences that grow businesses. Expert design and development.',
  keywords: ['web design', 'web development', 'digital agency', 'premium', 'next.js'],
  openGraph: {
    title: 'MASA Coders — Premium Digital Agency',
    description: 'We build digital products that drive real growth.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MASA Coders — Premium Digital Agency',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable}`}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9' },
          }}
        />
      </body>
    </html>
  );
}
