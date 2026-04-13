# Email & Subscription Configuration Guide

## Features Added

✅ **Newsletter Subscription** - Users can subscribe via a floating button
✅ **Contact Form Email** - Sends email to `contact@masacoders.tech` when someone submits the contact form  
✅ **Subscription Notification** - Sends email to `info@masacoders.tech` when someone subscribes

---

## Email Setup Instructions

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated 16-character password

3. **Update `.env.local`**:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_FROM=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_SUBSCRIPTION_TO=info@masacoders.tech
   EMAIL_CONTACT_TO=contact@masacoders.tech
   ```

### Option 2: SendGrid

1. **Create account** at [sendgrid.com](https://sendgrid.com)
2. **Get API Key** from settings
3. **Update `.env.local`**:
   ```
   EMAIL_SERVICE=SendGrid
   EMAIL_FROM=your-verified-sender@yourdomain.com
   EMAIL_PASSWORD=SG.your_sendgrid_api_key
   EMAIL_SUBSCRIPTION_TO=info@masacoders.tech
   EMAIL_CONTACT_TO=contact@masacoders.tech
   ```

### Option 3: Other SMTP Services

Update the `transporter` in `/src/lib/email.js` with your service config:

```javascript
const transporter = nodemailer.createTransport({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## How It Works

### 1. **Subscription Flow**
- User clicks "Subscribe" button (bottom right)
- Fills in email (name optional)
- API: `POST /api/subscribe`
- Email sent to `info@masacoders.tech` with subscriber details
- User sees success toast: "Successfully subscribed!"

### 2. **Contact Form Flow**
- User fills contact form
- Submits form
- API: `POST /api/inquiries`
- Email sent to `contact@masacoders.tech` with all details
- Data saved to MongoDB
- Admin views in `/admin/inquiries`

---

## Files Added/Modified

**New Files:**
- `/src/lib/email.js` - Email service utility
- `/src/models/Subscription.js` - Subscription database model
- `/src/app/api/subscribe/route.js` - Subscription API endpoint
- `/src/components/ui/SubscribeNewsletter.jsx` - Newsletter subscription UI

**Modified Files:**
- `/src/app/api/inquiries/route.js` - Added email notification
- `/src/components/layout/SiteLayout.jsx` - Added subscription component
- `/.env.local` - Added email config variables

---

## Testing Locally

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Test Subscription**:
   - Click "Subscribe" button (bottom right)
   - Enter test email
   - Check that email arrives at `info@masacoders.tech`

3. **Test Contact Form**:
   - Visit `/contact`
   - Fill and submit form
   - Check that email arrives at `contact@masacoders.tech`

4. **Check Database**:
   - Admin login: Navigate to `/admin/inquiries`
   - Should see submitted inquiries
   - (Subscriptions visible via MongoDB admin)

---

## Production Deployment

⚠️ **IMPORTANT**: Before deploying to production:

1. **Update email credentials** in environment variables on your hosting platform
2. **Use strong, secret passwords** (never commit real passwords)
3. **Set up SPF/DKIM records** for your domain to prevent spam folder
4. **Test emails** before going live
5. **Monitor email delivery** in your email service dashboard

---

## Email Templates

The email service supports two template types:

### Subscription Email
Sent to: `info@masacoders.tech`
Contains: Name, Email, Timestamp

### Contact Email  
Sent to: `contact@masacoders.tech`
Contains: Name, Email, Phone, Service, Budget, Subject, Message, IP Address

Both emails are HTML formatted and include company branding.

---

## Troubleshooting

**Emails not sending?**
1. Check `.env.local` has correct credentials
2. Verify `EMAIL_FROM` and `EMAIL_PASSWORD` are correct
3. Check email service console for errors
4. Try with test email first

**Gmail showing "Password incorrect"?**
1. Make sure you're using an **App Password** (not your regular password)
2. Re-generate app password if needed

**Email going to spam?**
1. Set up SPF record: `v=spf1 include:_spf.google.com ~all`
2. Set up DKIM signing in your email service
3. Ask users to mark emails as "Not spam"

---

## API Documentation

### Subscribe Endpoint
```bash
POST /api/subscribe
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}

# Response:
{
  "success": true,
  "message": "Successfully subscribed!"
}
```

### Contact Form (via Inquiries)
```bash
POST /api/inquiries
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "service": "Web Design & Development",
  "budget": "Rs. 3,00,000–7,50,000",
  "subject": "Website Project",
  "message": "I need a new website..."
}
```
