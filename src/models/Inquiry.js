import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  phone:   { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  service: { type: String, default: '' },
  budget:  { type: String, default: '' },
  isRead:  { type: Boolean, default: false },
  isReplied:{ type: Boolean, default: false },
  notes:   { type: String, default: '' },
  ip:      { type: String, default: '' },
}, { timestamps: true });

InquirySchema.index({ isRead: 1, createdAt: -1 });      // admin inbox list
InquirySchema.index({ isReplied: 1, createdAt: -1 });   // follow-up filter
InquirySchema.index({ email: 1 });                       // look up by contact email

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
