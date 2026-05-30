import mongoose from 'mongoose';

const ApprovalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['task', 'file', 'contract', 'invoice', 'leave', 'design', 'project_milestone', 'expense'],
    required: true,
  },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'revision_requested'],
    default: 'pending',
  },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote:  { type: String, default: '' },
  reviewedAt:  { type: Date },
  dueDate:     { type: Date },
  // Linked resources
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProject' },
  taskId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  invoiceId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  leaveRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest' },
  // File attachments for design/file approvals
  attachments: [{
    url:  String,
    name: String,
    size: Number,
    type: String,
  }],
  // Revision history
  revisions: [{
    note:       String,
    requestedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt:  { type: Date, default: Date.now },
  }],
  // Client-facing flag
  requiresClientApproval: { type: Boolean, default: false },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ApprovalSchema.index({ status: 1, createdAt: -1 });
ApprovalSchema.index({ requestedBy: 1, status: 1 });
ApprovalSchema.index({ approvers: 1, status: 1 });
ApprovalSchema.index({ type: 1, status: 1 });

export default mongoose.models.Approval || mongoose.model('Approval', ApprovalSchema);
