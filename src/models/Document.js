import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['file', 'folder'], default: 'file' },
  parentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  // File-specific
  url:         { type: String, default: '' },
  publicId:    { type: String, default: '' },
  mimeType:    { type: String, default: '' },
  extension:   { type: String, default: '' },
  size:        { type: Number, default: 0 },
  // Metadata
  category: {
    type: String,
    enum: ['contract', 'invoice', 'hr', 'legal', 'project', 'financial', 'brand', 'policy', 'other'],
    default: 'other',
  },
  tags:        [{ type: String }],
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Access control
  access: {
    type: String,
    enum: ['private', 'admin_only', 'staff', 'client_specific', 'all_clients', 'public'],
    default: 'admin_only',
  },
  allowedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProject' },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Document features
  isPinned:    { type: Boolean, default: false },
  isArchived:  { type: Boolean, default: false },
  isTemplate:  { type: Boolean, default: false },
  hasWatermark:{ type: Boolean, default: false },
  // Version control
  version:     { type: Number, default: 1 },
  versions: [{
    version:   Number,
    url:       String,
    publicId:  String,
    uploadedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt:{ type: Date, default: Date.now },
    note:      String,
  }],
  // Sharing
  shareToken:     { type: String },
  shareExpiresAt: { type: Date },
  downloadCount:  { type: Number, default: 0 },
}, { timestamps: true });

DocumentSchema.index({ parentId: 1, type: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ category: 1, access: 1 });
DocumentSchema.index({ projectId: 1 });
DocumentSchema.index({ clientId: 1 });
DocumentSchema.index({ tags: 1 });

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
