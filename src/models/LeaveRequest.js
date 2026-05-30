import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { type: String, enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid', 'other'], required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  days:      { type: Number, required: true },
  reason:    { type: String, required: true },
  status:    { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  reviewedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote:{ type: String, default: '' },
  reviewedAt:{ type: Date },
  attachments:[{ url: String, name: String }],
}, { timestamps: true });

LeaveRequestSchema.index({ userId: 1, status: 1 });
LeaveRequestSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
