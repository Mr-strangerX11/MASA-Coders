import mongoose from 'mongoose';

const DailyReportSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProject' },
  date:        { type: Date, required: true },
  summary:     { type: String, required: true },
  tasksCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  hoursWorked: { type: Number, default: 0 },
  blockers:    { type: String, default: '' },
  nextDayPlan: { type: String, default: '' },
  mood:        { type: String, enum: ['great', 'good', 'okay', 'stressed', 'bad'], default: 'good' },
  reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNote:  { type: String, default: '' },
  isReviewed:  { type: Boolean, default: false },
  pointsAwarded:{ type: Number, default: 2 },
}, { timestamps: true });

DailyReportSchema.index({ userId: 1, date: -1 });
DailyReportSchema.index({ date: -1, isReviewed: 1 });

export default mongoose.models.DailyReport || mongoose.model('DailyReport', DailyReportSchema);
