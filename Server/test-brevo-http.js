const axios = require('axios');
require('dotenv').config();

console.log('🔍 Testing Brevo HTTP API...');
console.log('Email:', process.env.BREVO_EMAIL);
console.log('API Key:', process.env.BREVO_API_KEY ? 'Found ✅' : 'Missing ❌');

const brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';
const headers = {
  'accept': 'application/json',
  'api-key': process.env.BREVO_API_KEY,
  'content-type': 'application/json'
};

const emailData = {
  sender: {
    name: "Final Year Project",
    email: process.env.BREVO_EMAIL
  },
  to: [{
    email: process.env.BREVO_EMAIL,
    name: "Test User"
  }],
  subject: "Brevo HTTP API Test - Final Year Project",
  htmlContent: `
    <h2>🎉 Brevo HTTP API Working!</h2>
    <p>Your email system is ready for the final year project!</p>
    <p>Sent at: ${new Date().toLocaleString()}</p>
    <p><strong>HTTP API Integration Successful!</strong></p>
    <p>This proves your email marketing system works!</p>
  `,
  textContent: "Brevo HTTP API Test - Your email system works!"
};

axios.post(brevoApiUrl, emailData, { headers })
  .then(response => {
    console.log('✅ Brevo HTTP API test successful!');
    console.log('Message ID:', response.data.messageId);
    console.log('Response:', response.data);
    console.log('Check your inbox:', process.env.BREVO_EMAIL);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Brevo HTTP API test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔧 Fix: Check your API key in .env file');
    }
    if (error.response?.status === 400) {
      console.log('🔧 Fix: Check your sender email address');
    }
    
    process.exit(1);
  });