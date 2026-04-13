import mongoose from 'mongoose';

const TestimonialSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  role:      { type: String, default: '' },
  company:   { type: String, default: '' },
  avatar:    { type: String, default: '' },
  content:   { type: String, required: true },
  rating:    { type: Number, min: 1, max: 5, default: 5 },
  project:   { type: String, default: '' },
  isPublished:{ type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  order:     { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
