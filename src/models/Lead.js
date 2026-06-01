import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  contact_name:    { type: String, required: true },
  contact_email:   { type: String, default: '' },
  contact_phone:   { type: String, default: '' },
  company_name:    { type: String, default: '' },
  service:         { type: String, default: '' },
  budget:          { type: String, default: '' },
  message:         { type: String, default: '' },
  source:          { type: String, default: 'manual', enum: ['manual', 'contact_form', 'website', 'referral', 'social'] },
  status:          { type: String, default: 'new',    enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] },
  priority:        { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
  estimated_value: { type: Number, default: 0 },
  notes:           { type: String, default: '' },
  isRead:          { type: Boolean, default: false },
}, { timestamps: true });

LeadSchema.index({ status: 1, createdAt: -1 });

LeadSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  obj.id = obj._id.toString();
  return obj;
};

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
