import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'task_assigned', 'task_completed', 'task_overdue',
      'project_update', 'project_completed',
      'invoice_sent', 'invoice_paid', 'invoice_overdue',
      'ticket_reply', 'ticket_resolved',
      'message', 'mention',
      'approval_request', 'approval_done',
      'leave_approved', 'leave_rejected',
      'announcement', 'system',
    ],
    required: true,
  },
  title:    { type: String, required: true },
  body:     { type: String, default: '' },
  link:     { type: String, default: '' },
  icon:     { type: String, default: '' },
  isRead:   { type: Boolean, default: false },
  readAt:   { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
