import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity:    { type: Number, required: true, default: 1 },
  rate:        { type: Number, required: true },
  amount:      { type: Number, required: true },
  taxRate:     { type: Number, default: 0 },
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  clientId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectId:    { type: mongoose.Schema.Types.ObjectId, ref: 'WorkProject' },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft',
  },
  items:       [InvoiceItemSchema],
  subtotal:    { type: Number, required: true },
  taxTotal:    { type: Number, default: 0 },
  discount:    { type: Number, default: 0 },
  total:       { type: Number, required: true },
  currency:    { type: String, default: 'USD' },
  notes:       { type: String, default: '' },
  terms:       { type: String, default: 'Payment due within 30 days.' },
  issueDate:   { type: Date, default: Date.now },
  dueDate:     { type: Date, required: true },
  paidAt:      { type: Date },
  paidAmount:  { type: Number, default: 0 },
  paymentMethod:{ type: String, default: '' },
  paymentRef:  { type: String, default: '' },
  sentAt:      { type: Date },
  viewedAt:    { type: Date },
  reminderSentAt:{ type: Date },
  // For PDF
  companyName:    { type: String, default: 'MASA Coders' },
  companyAddress: { type: String, default: '' },
  companyEmail:   { type: String, default: '' },
  companyPhone:   { type: String, default: '' },
  companyLogo:    { type: String, default: '' },
  vatNumber:      { type: String, default: '' },
}, { timestamps: true });

InvoiceSchema.index({ clientId: 1, status: 1 });
InvoiceSchema.index({ status: 1, dueDate: 1 });
InvoiceSchema.index({ invoiceNumber: 1 });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
