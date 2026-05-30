import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['admin', 'editor', 'manager', 'staff', 'client'], default: 'client' },
  avatar:     { type: String, default: '' },
  phone:      { type: String, default: '' },
  company:    { type: String, default: '' },
  department: { type: String, default: '' },
  jobTitle:   { type: String, default: '' },
  bio:        { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  timezone:   { type: String, default: 'Asia/Kathmandu' },
  // Auth tokens
  resetPasswordToken:  { type: String, default: null },
  resetPasswordExpiry: { type: Date, default: null },
  otp:       { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  // Staff-specific
  employeeId:   { type: String, default: '' },
  joiningDate:  { type: Date },
  salary:       { type: Number, default: 0 },
  bankDetails: {
    accountName:   { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    bankName:      { type: String, default: '' },
  },
  skills:    [{ type: String }],
  // Client-specific
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    country: { type: String, default: '' },
  },
  // Notification preferences
  notifications: {
    email:  { type: Boolean, default: true },
    push:   { type: Boolean, default: true },
    sms:    { type: Boolean, default: false },
  },
  lastLoginAt: { type: Date },
  lastSeenAt:  { type: Date },
}, { timestamps: true });

UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ department: 1, role: 1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.otp;
  return obj;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
