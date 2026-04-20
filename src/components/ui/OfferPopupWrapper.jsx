import connectDB from '@/lib/mongodb';
import Offer from '@/models/Offer';
import OfferPopup from './OfferPopup';

export default async function OfferPopupWrapper() {
  try {
    await connectDB();
    const now = new Date();
    const offer = await Offer.findOne({
      isActive: true,
      showPopup: true,
      startDate: { $lte: now },
      endDate:   { $gte: now },
    })
      .sort({ isFeatured: -1, order: 1 })
      .lean();

    if (!offer) return null;
    return <OfferPopup offer={JSON.parse(JSON.stringify(offer))} />;
  } catch {
    return null;
  }
}
