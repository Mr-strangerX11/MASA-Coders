import mongoose from 'mongoose';

const SubtaskSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  completed: { type: Boolean, default: false },
  assigneeId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt:{ type: Date },
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  attachments:[{ url: String, name: String }],
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProject', required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  column:      { type: String, default: 'Backlog' },
  status: {
    type: String,
    enum: ['backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled'],
    default: 'backlog',
  },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  type:        { type: String, enum: ['task', 'bug', 'feature', 'improvement', 'story'], default: 'task' },

  // Assignments
  assigneeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reporterId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Dates
  startDate:    { type: Date },
  dueDate:      { type: Date },
  completedAt:  { type: Date },
  estimatedHours:{ type: Number, default: 0 },
  loggedHours:   { type: Number, default: 0 },

  // Hierarchy
  parentTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  subtasks:     [SubtaskSchema],

  // Sprint
  sprint:    { type: Number, default: 1 },
  storyPoints:{ type: Number, default: 0 },

  // Content
  comments:    [CommentSchema],
  attachments: [{ url: String, name: String, size: Number, uploadedAt: Date }],
  tags:        [{ type: String }],
  order:       { type: Number, default: 0 },

  // Scoring
  pointsAwarded: { type: Number, default: 0 },
  isApproved:    { type: Boolean, default: false },
  approvedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt:    { type: Date },
}, { timestamps: true });

TaskSchema.index({ projectId: 1, column: 1, order: 1 });
TaskSchema.index({ assigneeIds: 1, status: 1 });
TaskSchema.index({ dueDate: 1, status: 1 });
TaskSchema.index({ sprint: 1, projectId: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
