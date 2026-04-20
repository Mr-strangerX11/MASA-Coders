import mongoose from 'mongoose';

const BlogPostSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true },
  excerpt:     { type: String, default: '', maxlength: 300 },
  content:     { type: String, required: true },
  thumbnail:   { type: String, default: '' },
  category:    { type: String, default: 'General' },
  tags:        [{ type: String }],
  author:      { type: String, default: 'MASA Coders Team' },
  authorAvatar:{ type: String, default: '' },
  status:      { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isFeatured:  { type: Boolean, default: false },
  readTime:    { type: Number, default: 5 },   // minutes
  views:       { type: Number, default: 0 },
  seoTitle:    { type: String, default: '' },
  seoDesc:     { type: String, default: '' },
  publishedAt: { type: Date },
}, { timestamps: true });

BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1, status: 1 });
BlogPostSchema.index({ isFeatured: 1, status: 1 });

export default mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema);
