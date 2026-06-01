/**
 * Platform email sender — singleton transport + typed helpers.
 * Never import nodemailer directly in route files. Use these helpers only.
 */
import nodemailer from 'nodemailer';
import { logger } from './logger.js';
import {
  invoiceSentTemplate, invoiceOverdueTemplate, invoicePaidTemplate,
  ticketCreatedTemplate, ticketRepliedTemplate, ticketResolvedTemplate,
  approvalRequestTemplate, approvalResultTemplate,
  welcomeClientTemplate, welcomeStaffTemplate,
  projectAssignedTemplate, leaveApprovedTemplate,
} from './emailTemplates.js';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const FROM     = `"MASA Coders" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;

// ── Singleton transport (one connection pool, not recreated per email) ─────────
let _transport = null;

function getTransport() {
  if (_transport) return _transport;

  const user = process.env.EMAIL_USER || process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_PASSWORD;
  const host = process.env.EMAIL_HOST;

  if (!user) return null;

  _transport = (!host || host === 'smtp.gmail.com')
    ? nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
    : nodemailer.createTransport({
        host,
        port:           parseInt(process.env.EMAIL_PORT) || 587,
        secure:         process.env.EMAIL_SECURE === 'true',
        auth:           { user, pass },
        tls:            { rejectUnauthorized: process.env.NODE_ENV === 'production' },
        pool:           true,
        maxConnections: 5,
      });

  return _transport;
}

// ── Core send function ────────────────────────────────────────────────────────
async function send(to, { subject, html }) {
  const transport = getTransport();
  if (!transport) {
    logger.warn('[email] Transport not configured — skipping', { to });
    return { ok: false, reason: 'not_configured' };
  }
  try {
    await transport.sendMail({ from: FROM, to, subject, html });
    logger.info('[email] Sent', { to, subject });
    return { ok: true };
  } catch (err) {
    logger.error('[email] Send failed', { to, error: err.message });
    _transport = null; // reset so next attempt tries a fresh connection
    return { ok: false, reason: err.message };
  }
}

// ── Invoice emails ────────────────────────────────────────────────────────────
export const emailInvoiceSent    = (c, inv) => send(c.email, invoiceSentTemplate({ client: c, invoice: inv, loginUrl: BASE_URL }));
export const emailInvoiceOverdue = (c, inv) => send(c.email, invoiceOverdueTemplate({ client: c, invoice: inv, loginUrl: BASE_URL }));
export const emailInvoicePaid    = (c, inv) => send(c.email, invoicePaidTemplate({ client: c, invoice: inv }));

// ── Ticket emails ─────────────────────────────────────────────────────────────
export const emailTicketCreated  = (c, t) => send(c.email, ticketCreatedTemplate({ client: c, ticket: t }));
export const emailTicketResolved = (c, t) => send(c.email, ticketResolvedTemplate({ client: c, ticket: t }));

export function emailTicketReplied(recipient, ticket, message, senderName) {
  const portalUrl = recipient.role === 'client'
    ? `${BASE_URL}/client/tickets/${ticket._id}`
    : `${BASE_URL}/admin/tickets/${ticket._id}`;
  return send(recipient.email, ticketRepliedTemplate({ recipient, ticket, message, senderName, portalUrl }));
}

// ── Approval emails ───────────────────────────────────────────────────────────
export const emailApprovalRequest = (approver, approval, requestedBy) =>
  send(approver.email, approvalRequestTemplate({ approver, approval, requestedBy, portalUrl: `${BASE_URL}/admin/approvals/${approval._id}` }));

export const emailApprovalResult = (requester, approval, action, reviewNote) =>
  send(requester.email, approvalResultTemplate({ requester, approval, action, reviewNote }));

// ── Welcome emails ────────────────────────────────────────────────────────────
export const emailWelcomeClient = (user) =>
  send(user.email, welcomeClientTemplate({ user, loginUrl: `${BASE_URL}/client/login` }));

export const emailWelcomeStaff = (user, tempPassword) =>
  send(user.email, welcomeStaffTemplate({ user, tempPassword, loginUrl: BASE_URL }));

// ── Project + Leave emails ────────────────────────────────────────────────────
export const emailProjectAssigned = (staff, project) =>
  send(staff.email, projectAssignedTemplate({ staff, project, portalUrl: `${BASE_URL}/staff/projects/${project._id}` }));

export const emailLeaveResult = (staff, leave) =>
  send(staff.email, leaveApprovedTemplate({ staff, leave }));
