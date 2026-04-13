import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  name:      { type: String, required: false },
  email:     { type: String, required: true, unique: true, lowercase: true },
  isActive:  { type: Boolean, default: true },
  ip:        { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
