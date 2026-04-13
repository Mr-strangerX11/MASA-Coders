import nodemailer from 'nodemailer';

function createTransporter() {
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 465,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  // Fallback: Gmail service
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

/**
 * Send email notification
 * @param {string} to - Recipient email (the user who submitted)
 * @param {object} data - Data for the template
 * @param {string} type - 'subscription' | 'contact'
 */
export async function sendEmail(to, data, type = 'contact') {
  const transporter = createTransporter();
  const FROM_ADDRESS = `"MASA Coders" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured (EMAIL_USER / EMAIL_PASSWORD missing)');
    return { success: false, error: 'Email not configured' };
  }

  console.log('📧 SMTP config:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER,
    passLength: process.env.EMAIL_PASSWORD?.length,
  });

  try {
    if (type === 'subscription') {
      await sendSubscriptionEmails(transporter, FROM_ADDRESS, to, data);
    } else if (type === 'contact') {
      await sendContactEmails(transporter, FROM_ADDRESS, to, data);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Email send error:', {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return { success: false, error: error.message };
  }
}

async function sendSubscriptionEmails(transporter, fromAddress, subscriberEmail, data) {
  const adminEmail = process.env.EMAIL_SUBSCRIPTION_TO || process.env.EMAIL_CONTACT_TO || process.env.EMAIL_USER;

  // 1. Admin notification
  await transporter.sendMail({
    from: fromAddress,
    to: adminEmail,
    subject: `New Newsletter Subscriber: ${subscriberEmail}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0066cc;">New Newsletter Subscriber</h2>
            <table style="width:100%; border-collapse:collapse;">
              <tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Email</strong></td><td style="padding:8px; border:1px solid #ddd;">${subscriberEmail}</td></tr>
              ${data.name ? `<tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Name</strong></td><td style="padding:8px; border:1px solid #ddd;">${data.name}</td></tr>` : ''}
              <tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Date</strong></td><td style="padding:8px; border:1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
            </table>
          </div>
        </body>
      </html>
    `,
  });
  console.log('✅ Subscription admin notification sent to:', adminEmail);

  // 2. Confirmation email to subscriber
  await transporter.sendMail({
    from: fromAddress,
    to: subscriberEmail,
    subject: 'Thank You for Subscribing to MASA Coders!',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0066cc; margin: 0;">MASA Coders</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Premium Digital Solutions</p>
            </div>
            <h2 style="color: #0066cc;">Thank You for Subscribing!</h2>
            <p>Hi ${data.name || 'there'},</p>
            <p>You're now subscribed to MASA Coders newsletter. You'll receive our latest insights, project updates, and exclusive offers.</p>
            <div style="background: #e3f2fd; padding: 15px; border-left: 4px solid #0066cc; margin: 20px 0; border-radius: 4px;">
              <p style="color: #0066cc; margin: 0;"><strong>Questions?</strong> Reach us at <a href="mailto:info@masacoders.tech" style="color:#0066cc;">info@masacoders.tech</a></p>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} MASA Coders. All rights reserved.</p>
          </div>
        </body>
      </html>
    `,
  });
  console.log('✅ Subscription confirmation sent to:', subscriberEmail);
}

async function sendContactEmails(transporter, fromAddress, userEmail, data) {
  const adminEmail = process.env.EMAIL_CONTACT_TO || process.env.EMAIL_SUBSCRIPTION_TO || process.env.EMAIL_USER;

  // 1. Admin notification with full inquiry details
  await transporter.sendMail({
    from: fromAddress,
    to: adminEmail,
    replyTo: userEmail,
    subject: `New Contact Inquiry from ${data.name}`,
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #0066cc;">New Contact Inquiry</h2>
            <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
              <tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; width:30%;"><strong>Name</strong></td><td style="padding:8px; border:1px solid #ddd;">${data.name}</td></tr>
              <tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Email</strong></td><td style="padding:8px; border:1px solid #ddd;"><a href="mailto:${userEmail}">${userEmail}</a></td></tr>
              ${data.phone ? `<tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Phone</strong></td><td style="padding:8px; border:1px solid #ddd;">${data.phone}</td></tr>` : ''}
              ${data.subject ? `<tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Subject</strong></td><td style="padding:8px; border:1px solid #ddd;">${data.subject}</td></tr>` : ''}
              ${data.service ? `<tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Service</strong></td><td style="padding:8px; border:1px solid #ddd;">${data.service}</td></tr>` : ''}
              ${data.budget ? `<tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Budget</strong></td><td style="padding:8px; border:1px solid #ddd;">${data.budget}</td></tr>` : ''}
              <tr><td style="padding:8px; border:1px solid #ddd; background:#f5f5f5;"><strong>Date</strong></td><td style="padding:8px; border:1px solid #ddd;">${new Date().toLocaleString()}</td></tr>
            </table>
            <div style="background:#f5f5f5; padding:15px; border-left:4px solid #0066cc; border-radius:4px;">
              <strong>Message:</strong>
              <p style="margin:10px 0 0 0; white-space:pre-wrap;">${data.message}</p>
            </div>
            <p style="margin-top:20px;">
              <a href="mailto:${userEmail}" style="background:#0066cc; color:white; padding:10px 20px; text-decoration:none; border-radius:5px; display:inline-block;">Reply to ${data.name}</a>
            </p>
          </div>
        </body>
      </html>
    `,
  });
  console.log('✅ Contact admin notification sent to:', adminEmail);

  // 2. Confirmation email to the user
  await transporter.sendMail({
    from: fromAddress,
    to: userEmail,
    subject: 'We Received Your Message — MASA Coders',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #0066cc; margin: 0;">MASA Coders</h1>
              <p style="color: #666; margin: 5px 0 0 0;">Premium Digital Solutions</p>
            </div>
            <h2 style="color: #0066cc;">Thanks for Reaching Out, ${data.name}!</h2>
            <p>We've received your message and will get back to you within 24 hours.</p>
            <div style="background:#f5f5f5; padding:15px; border-left:3px solid #0066cc; margin:20px 0; border-radius:4px;">
              <p style="margin:0;"><strong>Your inquiry:</strong></p>
              <p style="margin:8px 0 0 0; color:#555; white-space:pre-wrap;">${data.message}</p>
            </div>
            <p>For faster response, chat with us on WhatsApp:</p>
            <div style="text-align:center; margin:20px 0;">
              <a href="https://wa.me/9779705478032" style="background:#25d366; color:white; padding:12px 30px; text-decoration:none; border-radius:5px; font-weight:bold; display:inline-block;">Chat on WhatsApp</a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color:#999; font-size:12px; text-align:center;">
              MASA Coders · info@masacoders.tech · +977 9705478032<br/>
              © ${new Date().getFullYear()} MASA Coders. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,
  });
  console.log('✅ Contact confirmation sent to:', userEmail);
}
