import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:      { type: Date, required: true },
  checkIn:   { type: Date },
  checkOut:  { type: Date },
  workHours: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['present', 'absent', 'half_day', 'late', 'wfh', 'on_leave'],
    default: 'present',
  },
  notes:  { type: String, default: '' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress:  { type: String, default: '' },
}, { timestamps: true });

AttendanceSchema.index({ userId: 1, date: -1 });
AttendanceSchema.index({ date: 1, status: 1 });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
