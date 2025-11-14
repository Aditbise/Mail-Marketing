const brevo = require('@getbrevo/brevo');
require('dotenv').config();

console.log('🔍 Testing Brevo REST API...');
console.log('Email:', process.env.BREVO_EMAIL);
console.log('API Key:', process.env.BREVO_API_KEY ? 'Found ✅' : 'Missing ❌');

// Initialize Brevo
let defaultClient = brevo.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let apiInstance = new brevo.TransactionalEmailsApi();

// Create test email
let sendSmtpEmail = new brevo.SendSmtpEmail();
sendSmtpEmail.subject = "Brevo API Test - Final Year Project";
sendSmtpEmail.htmlContent = `
  <h2>🎉 Brevo REST API Working!</h2>
  <p>Your email system is ready for the final year project!</p>
  <p>Sent at: ${new Date().toLocaleString()}</p>
  <p><strong>API Integration Successful!</strong></p>
`;
sendSmtpEmail.sender = {
  "name": "Final Year Project",
  "email": process.env.BREVO_EMAIL
};
sendSmtpEmail.to = [{
  "email": process.env.BREVO_EMAIL,
  "name": "Test User"
}];

// Send email
apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
  console.log('✅ Brevo API test successful!');
  console.log('Message ID:', data.messageId);
  console.log('Check your inbox:', process.env.BREVO_EMAIL);
  process.exit(0);
}, function(error) {
  console.error('❌ Brevo API test failed:');
  console.error(error.response ? error.response.text : error.message);
  process.exit(1);
});