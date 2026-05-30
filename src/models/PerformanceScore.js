import mongoose from 'mongoose';

const PerformanceScoreSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  period:    { type: String, required: true }, // "2025-W01", "2025-05", "2025"
  periodType:{ type: String, enum: ['weekly', 'monthly', 'yearly'], required: true },
  // Score components
  tasksCompleted:   { type: Number, default: 0 },
  tasksOnTime:      { type: Number, default: 0 },
  tasksLate:        { type: Number, default: 0 },
  tasksMissed:      { type: Number, default: 0 },
  bugsReported:     { type: Number, default: 0 },
  clientApprovals:  { type: Number, default: 0 },
  dailyReports:     { type: Number, default: 0 },
  hoursLogged:      { type: Number, default: 0 },
  projectsCompleted:{ type: Number, default: 0 },
  // Computed
  rawScore:  { type: Number, default: 0 },
  rank:      { type: Number, default: 0 },
  badge:     { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond', ''], default: '' },
  // Breakdown
  scoreBreakdown: {
    taskPoints:     { type: Number, default: 0 },
    bonusPoints:    { type: Number, default: 0 },
    penaltyPoints:  { type: Number, default: 0 },
    reportPoints:   { type: Number, default: 0 },
  },
}, { timestamps: true });

PerformanceScoreSchema.index({ userId: 1, period: 1, periodType: 1 }, { unique: true });
PerformanceScoreSchema.index({ period: 1, rawScore: -1 });

export default mongoose.models.PerformanceScore || mongoose.model('PerformanceScore', PerformanceScoreSchema);
