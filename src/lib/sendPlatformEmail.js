/**
 * Platform email sender — wraps nodemailer with enterprise templates.
 * Import and call specific helpers from here; never call raw nodemailer directly for platform emails.
 */
import nodemailer from 'nodemailer';
import {
  invoiceSentTemplate, invoiceOverdueTemplate, invoicePaidTemplate,
  ticketCreatedTemplate, ticketRepliedTemplate, ticketResolvedTemplate,
  approvalRequestTemplate, approvalResultTemplate,
  welcomeClientTemplate, welcomeStaffTemplate,
  projectAssignedTemplate, leaveApprovedTemplate,
} from './emailTemplates.js';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const FROM     = `"MASA Coders" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;

function getTransport() {
  if (!process.env.EMAIL_USER && !process.env.EMAIL_FROM) return null;
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
      tls: { rejectUnauthorized: false },
    });
  }
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
  });
}

async function send(to, { subject, html }) {
  const transport = getTransport();
  if (!transport) {
    console.warn('[email] No transport configured — skipping email to', to);
    return { ok: false, reason: 'not_configured' };
  }
  try {
    await transport.sendMail({ from: FROM, to, subject, html });
    return { ok: true };
  } catch (err) {
    console.error('[email] Send failed:', err.message);
    return { ok: false, reason: err.message };
  }
}

// ── Invoice emails ────────────────────────────────────────────────────────────

export async function emailInvoiceSent(client, invoice) {
  return send(client.email, invoiceSentTemplate({ client, invoice, loginUrl: BASE_URL }));
}

export async function emailInvoiceOverdue(client, invoice) {
  return send(client.email, invoiceOverdueTemplate({ client, invoice, loginUrl: BASE_URL }));
}

export async function emailInvoicePaid(client, invoice) {
  return send(client.email, invoicePaidTemplate({ client, invoice }));
}

// ── Ticket emails ─────────────────────────────────────────────────────────────

export async function emailTicketCreated(client, ticket) {
  return send(client.email, ticketCreatedTemplate({ client, ticket }));
}

export async function emailTicketReplied(recipient, ticket, message, senderName) {
  const portalUrl = recipient.role === 'client'
    ? `${BASE_URL}/client/tickets/${ticket._id}`
    : `${BASE_URL}/admin/tickets/${ticket._id}`;
  return send(recipient.email, ticketRepliedTemplate({ recipient, ticket, message, senderName, portalUrl }));
}

export async function emailTicketResolved(client, ticket) {
  return send(client.email, ticketResolvedTemplate({ client, ticket }));
}

// ── Approval emails ───────────────────────────────────────────────────────────

export async function emailApprovalRequest(approver, approval, requestedBy) {
  const portalUrl = `${BASE_URL}/admin/approvals/${approval._id}`;
  return send(approver.email, approvalRequestTemplate({ approver, approval, requestedBy, portalUrl }));
}

export async function emailApprovalResult(requester, approval, action, reviewNote) {
  return send(requester.email, approvalResultTemplate({ requester, approval, action, reviewNote }));
}

// ── Welcome emails ────────────────────────────────────────────────────────────

export async function emailWelcomeClient(user) {
  return send(user.email, welcomeClientTemplate({ user, loginUrl: `${BASE_URL}/client/login` }));
}

export async function emailWelcomeStaff(user, tempPassword) {
  return send(user.email, welcomeStaffTemplate({ user, tempPassword, loginUrl: BASE_URL }));
}

// ── Project + Leave emails ────────────────────────────────────────────────────

export async function emailProjectAssigned(staff, project) {
  const portalUrl = `${BASE_URL}/staff/projects/${project._id}`;
  return send(staff.email, projectAssignedTemplate({ staff, project, portalUrl }));
}

export async function emailLeaveResult(staff, leave) {
  return send(staff.email, leaveApprovedTemplate({ staff, leave }));
}
