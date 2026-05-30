import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  description:{ type: String, default: '' },
  dueDate:    { type: Date },
  status:     { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  order:      { type: Number, default: 0 },
}, { timestamps: true });

const WorkProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'planning', 'active', 'on_hold', 'review', 'completed', 'cancelled'],
    default: 'planning',
  },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  type:        { type: String, enum: ['web', 'mobile', 'design', 'marketing', 'consulting', 'other'], default: 'web' },

  // Participants
  clientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  managerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamIds:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Timeline
  startDate:  { type: Date },
  deadline:   { type: Date },
  completedAt:{ type: Date },

  // Finance
  budget:     { type: Number, default: 0 },
  currency:   { type: String, default: 'USD' },
  hourlyRate: { type: Number, default: 0 },

  // Progress
  progress:   { type: Number, default: 0, min: 0, max: 100 },

  // Sprint tracking
  currentSprint: { type: Number, default: 1 },
  sprintDuration:{ type: Number, default: 14 }, // days

  // Content
  milestones: [MilestoneSchema],
  tags:       [{ type: String }],
  coverImage: { type: String, default: '' },
  color:      { type: String, default: '#6366f1' },

  // Kanban columns config
  columns: {
    type: [String],
    default: ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'],
  },

  // Settings
  isClientVisible: { type: Boolean, default: true },
  allowClientChat: { type: Boolean, default: true },
  allowFileUpload: { type: Boolean, default: true },

  notes:       { type: String, default: '' },
  attachments: [{ url: String, name: String, size: Number, uploadedAt: Date }],
}, { timestamps: true });

WorkProjectSchema.index({ status: 1, deadline: 1 });
WorkProjectSchema.index({ clientId: 1, status: 1 });
WorkProjectSchema.index({ managerId: 1, status: 1 });
WorkProjectSchema.index({ teamIds: 1 });

export default mongoose.models.WorkProject || mongoose.model('WorkProject', WorkProjectSchema);
