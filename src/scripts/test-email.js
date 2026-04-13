/**
 * Email Diagnostic Test
 * Run: node -r dotenv/config src/scripts/test-email.js
 * Or:  npm run dev (in another terminal) then use /api/email-test
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Read .env.local file directly
function loadEnv() {
  const envPath = path.join(__dirname, '../../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        env[key.trim()] = value.trim();
      }
    }
  });

  return env;
}

const ENV = loadEnv();

async function testEmailConnection() {
  console.log('\n🔍 EMAIL Configuration DIAGNOSTIC TEST\n');
  console.log('━'.repeat(60));

  // 1. Check environment variables
  console.log('\n1️⃣  ENVIRONMENT VARIABLES CHECK:');
  console.log('━'.repeat(60));

  const config = {
    EMAIL_HOST: ENV.EMAIL_HOST,
    EMAIL_PORT: ENV.EMAIL_PORT,
    EMAIL_SECURE: ENV.EMAIL_SECURE,
    EMAIL_USER: ENV.EMAIL_USER,
    EMAIL_FROM: ENV.EMAIL_FROM,
    EMAIL_PASSWORD: ENV.EMAIL_PASSWORD ? '***' + ENV.EMAIL_PASSWORD.slice(-5) : 'NOT SET',
  };

  Object.entries(config).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });

  // 2. Create transporter
  console.log('\n2️⃣  CREATING EMAIL TRANSPORTER:');
  console.log('━'.repeat(60));

  if (!ENV.EMAIL_HOST) {
    console.error('   ❌ EMAIL_HOST not set in .env.local');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: ENV.EMAIL_HOST,
    port: parseInt(ENV.EMAIL_PORT) || 465,
    secure: ENV.EMAIL_SECURE === 'true',
    auth: {
      user: ENV.EMAIL_USER,
      pass: ENV.EMAIL_PASSWORD,
    },
  });

  console.log('   ✅ Transporter created successfully');

  // 3. Verify connection
  console.log('\n3️⃣  VERIFYING SMTP CONNECTION:');
  console.log('━'.repeat(60));

  try {
    await transporter.verify();
    console.log('   ✅ SMTP connection verified successfully!');
    console.log('   Server is accepting connections');
  } catch (error) {
    console.error('   ❌ SMTP connection failed!');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Command: ${error.command}`);

    if (error.code === 'EAUTH') {
      console.error('\n   🔐 AUTHENTICATION FAILED');
      console.error('   Possible causes:');
      console.error('   • Wrong username/password');
      console.error('   • Account locked or disabled');
      console.error('   • Special characters in password not handled correctly');
    }

    if (error.code === 'ECONNREFUSED') {
      console.error('\n   🌐 CONNECTION REFUSED');
      console.error('   Possible causes:');
      console.error('   • Server address is wrong');
      console.error('   • Port is wrong');
      console.error('   • Firewall blocking connection');
    }

    console.error('\n   Full error:');
    console.error(JSON.stringify(error, null, 2));
    return;
  }

  // 4. Send test email
  console.log('\n4️⃣  SENDING TEST EMAIL:');
  console.log('━'.repeat(60));

  const testEmail = 'test@masacoders.tech'; // Use your test email
  console.log(`   Sending test email to: ${testEmail}`);

  try {
    const mailOptions = {
      from: ENV.EMAIL_FROM,
      to: testEmail,
      subject: '🧪 MASA Coders - Email System Test',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h2 style="color: #0066cc;">✅ Email System Working!</h2>
            <p style="font-size: 16px;">Timestamp: ${new Date().toLocaleString()}</p>
            <p>This test confirms your Titan email SMTP configuration is working correctly.</p>
            <hr style="border: 1px solid #ddd; margin: 20px 0;"/>
            <p><strong>Configuration Details:</strong></p>
            <ul>
              <li>Host: ${ENV.EMAIL_HOST}</li>
              <li>Port: ${ENV.EMAIL_PORT}</li>
              <li>Secure: ${ENV.EMAIL_SECURE}</li>
              <li>User: ${ENV.EMAIL_USER}</li>
              <li>From: ${ENV.EMAIL_FROM}</li>
            </ul>
          </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('   ✅ TEST EMAIL SENT SUCCESSFULLY!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Response: ${result.response}`);
    console.log(`\n   📧 Check ${testEmail} for the test email`);
  } catch (error) {
    console.error('   ❌ FAILED TO SEND TEST EMAIL');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);

    if (error.message.includes('530')) {
      console.error('\n   ⚠️  ERROR 530: REQUIRES AUTHENTICATION');
      console.error('   The server requires authentication but it failed.');
    }

    console.error('\n   Full error:');
    console.error(JSON.stringify(error, null, 2));
  }

  transporter.close();
  
  console.log('\n' + '━'.repeat(60));
  console.log('✅ DIAGNOSTIC TEST COMPLETE\n');
}

// Run the test
testEmailConnection().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
