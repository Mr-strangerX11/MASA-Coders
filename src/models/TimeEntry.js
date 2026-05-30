import mongoose from 'mongoose';

const TimeEntrySchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  projectId:  { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProject', required: true },
  description:{ type: String, default: '' },
  startTime:  { type: Date, required: true },
  endTime:    { type: Date },
  duration:   { type: Number, default: 0 }, // minutes
  isBillable: { type: Boolean, default: true },
  isRunning:  { type: Boolean, default: false },
}, { timestamps: true });

TimeEntrySchema.index({ userId: 1, startTime: -1 });
TimeEntrySchema.index({ projectId: 1, isBillable: 1 });
TimeEntrySchema.index({ taskId: 1 });

export default mongoose.models.TimeEntry || mongoose.model('TimeEntry', TimeEntrySchema);
