import mongoose from 'mongoose';

const TicketMessageSchema = new mongoose.Schema({
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole:  { type: String, enum: ['admin', 'staff', 'client'], required: true },
  content:     { type: String, required: true },
  attachments: [{ url: String, name: String, size: Number }],
  isInternal:  { type: Boolean, default: false },
}, { timestamps: true });

const TicketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  subject:      { type: String, required: true },
  description:  { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_client', 'resolved', 'closed'],
    default: 'open',
  },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category:    { type: String, enum: ['billing', 'technical', 'project', 'general', 'bug', 'feature_request'], default: 'general' },
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProject' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages:    [TicketMessageSchema],
  attachments: [{ url: String, name: String, size: Number }],
  tags:        [{ type: String }],
  resolvedAt:  { type: Date },
  closedAt:    { type: Date },
  firstResponseAt: { type: Date },
  satisfactionRating: { type: Number, min: 1, max: 5 },
  satisfactionNote:   { type: String, default: '' },
}, { timestamps: true });

TicketSchema.index({ clientId: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ status: 1, priority: 1 });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
