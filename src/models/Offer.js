import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  subtitle:    { type: String, default: '' },
  description: { type: String, required: true },
  discount:    { type: String, default: '' },      // e.g., "30% OFF" or "Free Consultation"
  badge:       { type: String, default: '' },      // e.g., "Limited Time", "Hot Deal"
  couponCode:  { type: String, default: '' },
  ctaText:     { type: String, default: 'Claim Offer' },
  ctaLink:     { type: String, default: '/contact' },
  bannerImage: { type: String, default: '' },
  color:       { type: String, default: '#2563eb' }, // card accent color
  startDate:   { type: Date, required: true },
  endDate:     { type: Date, required: true },
  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },  // show on homepage banner
  showPopup:   { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

OfferSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

OfferSchema.index({ isActive: 1, endDate: 1 });

export default mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
