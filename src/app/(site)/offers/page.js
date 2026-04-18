import ContactCTA from '@/components/sections/ContactCTA';
import OffersGrid from '@/components/sections/OffersGrid';
import connectDB from '@/lib/mongodb';
import Offer from '@/models/Offer';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Special Offers' };

async function getOffers() {
  try {
    await connectDB();
    const now = new Date();
    const offers = await Offer.find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } })
      .sort({ isFeatured: -1, order: 1, createdAt: -1 })
      .lean();
    // Serialize for Client Component
    return JSON.parse(JSON.stringify(offers));
  } catch { return []; }
}

export default async function OffersPage() {
  const offers = await getOffers();

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-[#060912] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/10 to-transparent pointer-events-none" />
        <div className="container-custom relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-6">
            🔥 Limited Time Deals
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Exclusive <span className="gradient-text-gold">Offers & Deals</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Don't miss these limited-time opportunities to get premium services at special prices.
          </p>
        </div>
      </section>

      {/* Offers */}
      <section className="section bg-white">
        <div className="container-custom">
          <OffersGrid offers={offers} />
        </div>
      </section>

      <ContactCTA />
    </>
  );
}
