export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Notification from '@/models/Notification';
import { requireAdmin, requireClient } from '@/lib/auth';

function nextInvoiceNumber() {
  const d = new Date();
  const ts = String(Date.now()).slice(-5);
  return `INV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${ts}`;
}

// GET /api/invoices
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Clients can view their own invoices
    const clientDecoded = await requireClient(request);
    if (!clientDecoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const filter = {};

    if (clientDecoded.role === 'client') {
      filter.clientId = clientDecoded.id;
    } else {
      const clientId = searchParams.get('clientId');
      if (clientId) filter.clientId = clientId;
    }

    const status = searchParams.get('status');
    if (status) filter.status = status;

    const page  = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('clientId', 'name email company avatar')
        .populate('projectId', 'title')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    return NextResponse.json({ invoices, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET /api/invoices:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// POST /api/invoices (admin only)
export async function POST(request) {
  try {
    const decoded = await requireAdmin(request);
    if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { clientId, projectId, items, discount, currency, dueDate, notes, terms } = body;

    if (!clientId || !items?.length || !dueDate) {
      return NextResponse.json({ error: 'Client, items, and due date are required.' }, { status: 400 });
    }

    const enrichedItems = items.map(item => ({
      ...item,
      amount: item.quantity * item.rate,
    }));
    const subtotal = enrichedItems.reduce((s, i) => s + i.amount, 0);
    const taxTotal = enrichedItems.reduce((s, i) => s + (i.amount * (i.taxRate || 0) / 100), 0);
    const total    = subtotal + taxTotal - (discount || 0);

    const invoice = await Invoice.create({
      invoiceNumber: nextInvoiceNumber(),
      clientId, projectId, items: enrichedItems,
      subtotal, taxTotal, discount: discount || 0, total,
      currency: currency || 'USD',
      dueDate, notes, terms,
      status: 'draft',
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (err) {
    console.error('POST /api/invoices:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
