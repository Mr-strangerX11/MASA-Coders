import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true },
  icon:        { type: String, default: 'FiCode' },  // react-icons name
  description: { type: String, required: true },
  shortDesc:   { type: String, default: '', maxlength: 200 },
  features:    [{ type: String }],
  price:       { type: String, default: '' },         // e.g., "Starting at $999"
  duration:    { type: String, default: '' },          // e.g., "2-4 weeks"
  image:       { type: String, default: '' },
  ctaText:     { type: String, default: 'Get Started' },
  isVisible:   { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
