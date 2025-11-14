const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Testing Brevo connection...');
console.log('Email:', process.env.BREVO_EMAIL);
console.log('API Key:', process.env.BREVO_API_KEY ? 'Found ✅' : 'Missing ❌');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_API_KEY
  }
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Brevo connection failed:', error.message);
  } else {
    console.log('✅ Brevo connection successful! Ready to send emails!');
  }
});

// Send a quick test
transporter.sendMail({
  from: `"Final Year Project" <${process.env.BREVO_EMAIL}>`,
  to: process.env.BREVO_EMAIL, // Send to yourself
  subject: 'Brevo API Test - Final Year Project',
  html: `
    <h2>🎉 Brevo API Working!</h2>
    <p>Your email system is ready for the final year project!</p>
    <p>Sent at: ${new Date().toLocaleString()}</p>
  `
}, (error, info) => {
  if (error) {
    console.log('❌ Test email failed:', error.message);
  } else {
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox:', process.env.BREVO_EMAIL);
  }
  process.exit();
});