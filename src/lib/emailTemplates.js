/**
 * Enterprise email templates for the internal platform.
 * Covers: invoices, tickets, approvals, welcome, task notifications.
 */

const BRAND = {
  name:    'MASA Coders',
  email:   process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@masacoders.tech',
  phone:   '+977 9705478032',
  website: process.env.NEXT_PUBLIC_SITE_URL || 'https://masacoders.tech',
  color:   '#6366f1',
};

function baseLayout(content, title = 'Notification') {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f1f5f9; color: #0f172a; }
  .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: ${BRAND.color}; padding: 32px 40px; }
  .header h1 { color: #fff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
  .header p  { color: rgba(255,255,255,0.75); font-size: 14px; margin-top: 4px; }
  .body   { padding: 32px 40px; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center; color: #94a3b8; font-size: 12px; }
  .btn    { display: inline-block; background: ${BRAND.color}; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; }
  .info-box { background: #f8fafc; border-left: 3px solid ${BRAND.color}; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 16px 0; }
  table.data { width: 100%; border-collapse: collapse; margin: 16px 0; }
  table.data td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
  table.data td:first-child { color: #64748b; width: 40%; }
  table.data td:last-child  { font-weight: 500; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .status.paid     { background: #d1fae5; color: #065f46; }
  .status.overdue  { background: #fee2e2; color: #991b1b; }
  .status.pending  { background: #fef3c7; color: #92400e; }
  .status.approved { background: #d1fae5; color: #065f46; }
  .status.rejected { background: #fee2e2; color: #991b1b; }
  .status.open     { background: #dbeafe; color: #1e40af; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  h2 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  p  { font-size: 14px; line-height: 1.6; color: #475569; margin: 8px 0; }
</style></head><body>
<div class="wrapper">
  <div class="header">
    <h1>${BRAND.name}</h1>
    <p>Enterprise Platform</p>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    &copy; ${new Date().getFullYear()} ${BRAND.name} &nbsp;·&nbsp;
    <a href="mailto:${BRAND.email}" style="color:${BRAND.color}">${BRAND.email}</a> &nbsp;·&nbsp;
    ${BRAND.phone}
  </div>
</div></body></html>`;
}

// ─── INVOICE TEMPLATES ───────────────────────────────────────────────────────

export function invoiceSentTemplate({ client, invoice, loginUrl }) {
  const subject = `Invoice ${invoice.invoiceNumber} — ${invoice.currency} ${invoice.total.toFixed(2)}`;
  const html = baseLayout(`
    <h2>New Invoice from ${BRAND.name}</h2>
    <p>Hi ${client.name},</p>
    <p>A new invoice has been issued for your account. Please review the details below.</p>
    <table class="data">
      <tr><td>Invoice #</td><td>${invoice.invoiceNumber}</td></tr>
      <tr><td>Amount</td><td><strong>${invoice.currency} ${invoice.total.toFixed(2)}</strong></td></tr>
      <tr><td>Issue Date</td><td>${new Date(invoice.issueDate).toLocaleDateString()}</td></tr>
      <tr><td>Due Date</td><td><strong>${new Date(invoice.dueDate).toLocaleDateString()}</strong></td></tr>
      <tr><td>Status</td><td><span class="status pending">Unpaid</span></td></tr>
    </table>
    <a class="btn" href="${loginUrl}/client/invoices/${invoice._id}">View Invoice</a>
    <hr class="divider"/>
    <p style="font-size:12px;color:#94a3b8">This is an automated notification from the ${BRAND.name} client portal.</p>
  `, subject);
  return { subject, html };
}

export function invoiceOverdueTemplate({ client, invoice, loginUrl }) {
  const subject = `⚠️ Overdue Invoice ${invoice.invoiceNumber} — Action Required`;
  const html = baseLayout(`
    <h2>Invoice Overdue Notice</h2>
    <p>Hi ${client.name},</p>
    <p>Your invoice <strong>${invoice.invoiceNumber}</strong> was due on <strong>${new Date(invoice.dueDate).toLocaleDateString()}</strong> and is now overdue.</p>
    <div class="info-box">
      <strong>Amount Due: ${invoice.currency} ${invoice.total.toFixed(2)}</strong><br/>
      <span style="color:#ef4444">Overdue by ${Math.floor((Date.now() - new Date(invoice.dueDate)) / 86400000)} day(s)</span>
    </div>
    <p>Please settle this invoice at your earliest convenience to avoid any service interruption.</p>
    <a class="btn" href="${loginUrl}/client/invoices/${invoice._id}">View Invoice</a>
  `, subject);
  return { subject, html };
}

export function invoicePaidTemplate({ client, invoice }) {
  const subject = `✅ Payment Received — Invoice ${invoice.invoiceNumber}`;
  const html = baseLayout(`
    <h2>Payment Confirmed!</h2>
    <p>Hi ${client.name},</p>
    <p>We've received your payment for invoice <strong>${invoice.invoiceNumber}</strong>. Thank you!</p>
    <table class="data">
      <tr><td>Invoice #</td><td>${invoice.invoiceNumber}</td></tr>
      <tr><td>Amount Paid</td><td><strong>${invoice.currency} ${invoice.total.toFixed(2)}</strong></td></tr>
      <tr><td>Paid On</td><td>${new Date().toLocaleDateString()}</td></tr>
      <tr><td>Status</td><td><span class="status paid">Paid</span></td></tr>
    </table>
    <p>Your receipt is available in the client portal.</p>
  `, subject);
  return { subject, html };
}

// ─── TICKET TEMPLATES ─────────────────────────────────────────────────────────

export function ticketCreatedTemplate({ client, ticket }) {
  const subject = `Support Ticket Created — ${ticket.ticketNumber}`;
  const html = baseLayout(`
    <h2>Your Support Ticket Was Created</h2>
    <p>Hi ${client.name},</p>
    <p>We've received your support request and will get back to you as soon as possible.</p>
    <table class="data">
      <tr><td>Ticket #</td><td>${ticket.ticketNumber}</td></tr>
      <tr><td>Subject</td><td>${ticket.subject}</td></tr>
      <tr><td>Category</td><td>${ticket.category?.replace('_', ' ')}</td></tr>
      <tr><td>Priority</td><td>${ticket.priority}</td></tr>
      <tr><td>Status</td><td><span class="status open">Open</span></td></tr>
    </table>
    <p>You can track progress and reply via your client portal.</p>
  `, subject);
  return { subject, html };
}

export function ticketRepliedTemplate({ recipient, ticket, message, senderName, portalUrl }) {
  const subject = `New Reply on Ticket ${ticket.ticketNumber} — ${ticket.subject}`;
  const html = baseLayout(`
    <h2>New Reply on Your Support Ticket</h2>
    <p>Hi ${recipient.name},</p>
    <p><strong>${senderName}</strong> replied to your support ticket:</p>
    <div class="info-box">
      <strong>${ticket.subject}</strong>
      <p style="margin-top:8px">${message}</p>
    </div>
    <a class="btn" href="${portalUrl}">View Full Conversation</a>
  `, subject);
  return { subject, html };
}

export function ticketResolvedTemplate({ client, ticket }) {
  const subject = `✅ Ticket Resolved — ${ticket.ticketNumber}`;
  const html = baseLayout(`
    <h2>Your Support Ticket Has Been Resolved</h2>
    <p>Hi ${client.name},</p>
    <p>Your support ticket <strong>${ticket.ticketNumber}</strong> — "${ticket.subject}" has been marked as resolved.</p>
    <p>If you're satisfied with the resolution, no further action is needed. If the issue persists, you can reopen the ticket from your portal.</p>
  `, subject);
  return { subject, html };
}

// ─── APPROVAL TEMPLATES ───────────────────────────────────────────────────────

export function approvalRequestTemplate({ approver, approval, requestedBy, portalUrl }) {
  const subject = `Approval Needed: ${approval.title}`;
  const html = baseLayout(`
    <h2>Approval Request</h2>
    <p>Hi ${approver.name},</p>
    <p><strong>${requestedBy.name}</strong> has submitted a request requiring your approval.</p>
    <table class="data">
      <tr><td>Type</td><td>${approval.type?.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</td></tr>
      <tr><td>Title</td><td>${approval.title}</td></tr>
      <tr><td>Priority</td><td>${approval.priority}</td></tr>
      ${approval.dueDate ? `<tr><td>Due By</td><td>${new Date(approval.dueDate).toLocaleDateString()}</td></tr>` : ''}
    </table>
    ${approval.description ? `<div class="info-box">${approval.description}</div>` : ''}
    <a class="btn" href="${portalUrl}">Review Request</a>
  `, subject);
  return { subject, html };
}

export function approvalResultTemplate({ requester, approval, action, reviewNote }) {
  const approved = action === 'approve';
  const subject  = `${approved ? '✅ Approved' : '❌ Rejected'}: ${approval.title}`;
  const html = baseLayout(`
    <h2>${approved ? 'Your Request Was Approved!' : 'Your Request Was Rejected'}</h2>
    <p>Hi ${requester.name},</p>
    <p>Your <strong>${approval.type?.replace('_', ' ')}</strong> request "<strong>${approval.title}</strong>" has been <strong>${action === 'approve' ? 'approved' : 'rejected'}</strong>.</p>
    ${reviewNote ? `<div class="info-box"><strong>Note from reviewer:</strong><br/>${reviewNote}</div>` : ''}
  `, subject);
  return { subject, html };
}

// ─── WELCOME TEMPLATES ────────────────────────────────────────────────────────

export function welcomeClientTemplate({ user, loginUrl }) {
  const subject = `Welcome to ${BRAND.name} Client Portal, ${user.name}!`;
  const html = baseLayout(`
    <h2>Welcome to Your Client Portal!</h2>
    <p>Hi ${user.name},</p>
    <p>Your account has been set up on the ${BRAND.name} client portal. You can now track your projects, view invoices, and communicate with our team — all in one place.</p>
    <div class="info-box">
      <strong>Your portal access:</strong><br/>
      Email: ${user.email}<br/>
      Portal: <a href="${loginUrl}" style="color:${BRAND.color}">${loginUrl}</a>
    </div>
    <a class="btn" href="${loginUrl}">Access Your Portal</a>
    <p>If you have any questions, open a support ticket from within your portal or reply to this email.</p>
  `, subject);
  return { subject, html };
}

export function welcomeStaffTemplate({ user, tempPassword, loginUrl }) {
  const subject = `Welcome to ${BRAND.name} — Your Staff Account`;
  const html = baseLayout(`
    <h2>Your Staff Account Is Ready</h2>
    <p>Hi ${user.name},</p>
    <p>Your staff account for the ${BRAND.name} platform has been created.</p>
    <table class="data">
      <tr><td>Email</td><td>${user.email}</td></tr>
      ${tempPassword ? `<tr><td>Temp Password</td><td><strong>${tempPassword}</strong></td></tr>` : ''}
      <tr><td>Department</td><td>${user.department || '—'}</td></tr>
      <tr><td>Role</td><td>${user.role}</td></tr>
    </table>
    ${tempPassword ? '<p>Please change your password upon first login.</p>' : ''}
    <a class="btn" href="${loginUrl}/staff/login">Login to Staff Portal</a>
  `, subject);
  return { subject, html };
}

// ─── PROJECT TEMPLATES ────────────────────────────────────────────────────────

export function projectAssignedTemplate({ staff, project, portalUrl }) {
  const subject = `You've Been Added to Project: ${project.title}`;
  const html = baseLayout(`
    <h2>New Project Assignment</h2>
    <p>Hi ${staff.name},</p>
    <p>You have been added to the project <strong>${project.title}</strong>.</p>
    <table class="data">
      <tr><td>Project</td><td>${project.title}</td></tr>
      <tr><td>Status</td><td>${project.status?.replace('_', ' ')}</td></tr>
      ${project.deadline ? `<tr><td>Deadline</td><td>${new Date(project.deadline).toLocaleDateString()}</td></tr>` : ''}
      <tr><td>Priority</td><td>${project.priority}</td></tr>
    </table>
    <a class="btn" href="${portalUrl}">View Project</a>
  `, subject);
  return { subject, html };
}

export function leaveApprovedTemplate({ staff, leave }) {
  const approved = leave.status === 'approved';
  const subject  = `Leave Request ${approved ? 'Approved ✅' : 'Rejected ❌'}`;
  const html = baseLayout(`
    <h2>Leave Request ${approved ? 'Approved' : 'Rejected'}</h2>
    <p>Hi ${staff.name},</p>
    <p>Your ${leave.type?.replace('_', ' ')} leave request has been <strong>${leave.status}</strong>.</p>
    <table class="data">
      <tr><td>Type</td><td>${leave.type?.replace('_', ' ')}</td></tr>
      <tr><td>From</td><td>${new Date(leave.startDate).toLocaleDateString()}</td></tr>
      <tr><td>To</td><td>${new Date(leave.endDate).toLocaleDateString()}</td></tr>
      <tr><td>Days</td><td>${leave.days}</td></tr>
      <tr><td>Status</td><td><span class="status ${leave.status}">${leave.status}</span></td></tr>
    </table>
    ${leave.reviewNote ? `<div class="info-box"><strong>Note:</strong> ${leave.reviewNote}</div>` : ''}
  `, subject);
  return { subject, html };
}
