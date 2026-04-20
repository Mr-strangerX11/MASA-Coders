import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true },
  category:    { type: String, required: true },
  thumbnail:   { type: String, default: '' },
  gallery:     [{ type: String }],
  shortDesc:   { type: String, required: true, maxlength: 300 },
  description: { type: String, required: true },
  technologies:[{ type: String }],
  result:      { type: String, default: '' },
  impact:      { type: String, default: '' },
  clientName:  { type: String, default: '' },
  projectUrl:  { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'published', 'featured', 'archived'],
    default: 'draft',
  },
  isFeatured:  { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  completedAt: { type: Date },
}, { timestamps: true });

ProjectSchema.index({ status: 1, isFeatured: 1 });
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ order: 1, status: 1 });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
