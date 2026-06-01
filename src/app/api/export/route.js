export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Lead from '@/models/Lead';
import Inquiry from '@/models/Inquiry';
import Invoice from '@/models/Invoice';

function toCSV(rows, columns) {
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  const header = columns.map(c => c.label).join(',');
  const body   = rows.map(row => columns.map(c => escape(row[c.key])).join(',')).join('\n');
  return `${header}\n${body}`;
}

const SCHEMAS = {
  users: {
    model: () => User.find({}).select('name email role company phone isActive isVerified createdAt').lean(),
    columns: [
      { label: 'Name',      key: 'name'       },
      { label: 'Email',     key: 'email'      },
      { label: 'Role',      key: 'role'       },
      { label: 'Company',   key: 'company'    },
      { label: 'Phone',     key: 'phone'      },
      { label: 'Active',    key: 'isActive'   },
      { label: 'Verified',  key: 'isVerified' },
      { label: 'Joined',    key: 'createdAt'  },
    ],
  },
  leads: {
    model: () => Lead.find({}).lean(),
    columns: [
      { label: 'Name',            key: 'contact_name'    },
      { label: 'Email',           key: 'contact_email'   },
      { label: 'Phone',           key: 'contact_phone'   },
      { label: 'Company',         key: 'company_name'    },
      { label: 'Service',         key: 'service'         },
      { label: 'Budget',          key: 'budget'          },
      { label: 'Status',          key: 'status'          },
      { label: 'Priority',        key: 'priority'        },
      { label: 'Estimated Value', key: 'estimated_value' },
      { label: 'Source',          key: 'source'          },
      { label: 'Date',            key: 'createdAt'       },
    ],
  },
  inquiries: {
    model: () => Inquiry.find({}).lean(),
    columns: [
      { label: 'Name',     key: 'name'      },
      { label: 'Email',    key: 'email'     },
      { label: 'Phone',    key: 'phone'     },
      { label: 'Subject',  key: 'subject'   },
      { label: 'Service',  key: 'service'   },
      { label: 'Budget',   key: 'budget'    },
      { label: 'Message',  key: 'message'   },
      { label: 'Read',     key: 'isRead'    },
      { label: 'Replied',  key: 'isReplied' },
      { label: 'Date',     key: 'createdAt' },
    ],
  },
  invoices: {
    model: () => Invoice.find({}).select('invoiceNumber clientName status total dueDate createdAt').lean(),
    columns: [
      { label: 'Invoice #',  key: 'invoiceNumber' },
      { label: 'Client',     key: 'clientName'    },
      { label: 'Status',     key: 'status'        },
      { label: 'Total',      key: 'total'         },
      { label: 'Due Date',   key: 'dueDate'       },
      { label: 'Created',    key: 'createdAt'     },
    ],
  },
};

// GET /api/export?type=users|leads|inquiries|invoices
export async function GET(request) {
  const decoded = await requireAdmin(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!SCHEMAS[type]) {
    return NextResponse.json({ error: `Invalid type. Use: ${Object.keys(SCHEMAS).join(', ')}` }, { status: 400 });
  }

  await connectDB();
  const schema = SCHEMAS[type];
  const rows   = await schema.model();
  const csv    = toCSV(rows, schema.columns);
  const filename = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
