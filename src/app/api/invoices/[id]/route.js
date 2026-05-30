export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Notification from '@/models/Notification';
import { requireAdmin, requireClient } from '@/lib/auth';
import { emailInvoiceSent, emailInvoicePaid } from '@/lib/sendPlatformEmail';

export async function GET(request, { params }) {
  try {
    const decoded = await requireClient(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const invoice = await Invoice.findById(params.id)
      .populate('clientId', 'name email company phone address avatar')
      .populate('projectId', 'title')
      .lean();

    if (!invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });

    if (decoded.role === 'client' && invoice.clientId?._id?.toString() !== decoded.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    // Mark as viewed if client is seeing it for first time
    if (decoded.role === 'client' && invoice.status === 'sent') {
      await Invoice.findByIdAndUpdate(params.id, { status: 'viewed', viewedAt: new Date() });
    }

    return NextResponse.json({ invoice });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();

    // Handle special status transitions
    if (body.status === 'sent' && !body.sentAt) body.sentAt = new Date();
    if (body.status === 'paid' && !body.paidAt) body.paidAt = new Date();

    const invoice = await Invoice.findByIdAndUpdate(params.id, { $set: body }, { new: true })
      .populate('clientId', 'name email company avatar')
      .populate('projectId', 'title');

    if (!invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });

    // Notify + email client when sent
    if (body.status === 'sent' && invoice.clientId) {
      await Notification.create({
        userId: invoice.clientId._id,
        type: 'invoice_sent',
        title: 'New invoice received',
        body: `Invoice ${invoice.invoiceNumber} — ${invoice.currency} ${invoice.total.toFixed(2)}`,
        link: `/client/invoices/${invoice._id}`,
      });
      emailInvoiceSent(invoice.clientId, invoice).catch(() => {});
    }

    // Notify + email client when paid
    if (body.status === 'paid' && invoice.clientId) {
      await Notification.create({
        userId: invoice.clientId._id,
        type: 'invoice_paid',
        title: `Invoice ${invoice.invoiceNumber} marked as paid`,
        body: `${invoice.currency} ${invoice.total.toFixed(2)}`,
        link: `/client/invoices/${invoice._id}`,
      });
      emailInvoicePaid(invoice.clientId, invoice).catch(() => {});
    }

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error('PATCH /api/invoices/[id]:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const invoice = await Invoice.findById(params.id);
    if (!invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
    if (invoice.status === 'paid') return NextResponse.json({ error: 'Cannot delete a paid invoice.' }, { status: 400 });

    await Invoice.findByIdAndDelete(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
