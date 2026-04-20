import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import ScrollToTop from './ScrollToTop';
import { Suspense } from 'react';
import OfferPopupWrapper from '@/components/ui/OfferPopupWrapper';

export default function SiteLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppButton />
      <ScrollToTop />
      <Suspense fallback={null}>
        <OfferPopupWrapper />
      </Suspense>
    </>
  );
}
