const axios = require('axios');

class EmailService {
  constructor() {
    // Brevo API configuration
    this.brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';
    this.headers = {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    };
  }

  async sendCampaignEmails(campaign) {
    console.log(`🚀 Starting campaign: ${campaign.name}`);
    console.log(`📧 Sending to ${campaign.recipients.length} recipients via Brevo HTTP API`);
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const recipient of campaign.recipients) {
      for (const emailBody of campaign.emailBodies) {
        try {
          const personalizedContent = this.personalizeEmail(
            emailBody.bodyContent, 
            recipient, 
            campaign.companyInfo
          );
          
          // Brevo API payload
          const emailData = {
            sender: {
              name: campaign.companyInfo?.name || 'Final Year Project',
              email: process.env.BREVO_EMAIL
            },
            to: [{
              email: recipient.email,
              name: recipient.name || 'Valued Customer'
            }],
            subject: emailBody.Name || 'Newsletter from Final Year Project',
            htmlContent: personalizedContent,
            textContent: this.stripHtml(personalizedContent)
          };

          console.log(`📤 Sending to: ${recipient.email}`);
          
          const response = await axios.post(this.brevoApiUrl, emailData, {
            headers: this.headers
          });
          
          results.push({
            email: recipient.email,
            name: recipient.name,
            success: true,
            messageId: response.data.messageId,
            timestamp: new Date()
          });
          
          successCount++;
          console.log(`✅ Sent successfully to: ${recipient.email} (ID: ${response.data.messageId})`);
          
          // Small delay to be respectful to API
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Failed to send to ${recipient.email}:`, error.response?.data || error.message);
          results.push({
            email: recipient.email,
            name: recipient.name,
            success: false,
            error: error.response?.data?.message || error.message,
            timestamp: new Date()
          });
          failCount++;
        }
      }
    }
    
    console.log(`🎯 Campaign completed: ${successCount} success, ${failCount} failed`);
    
    return {
      success: true,
      totalSent: successCount,
      totalFailed: failCount,
      results: results,
      summary: {
        campaignName: campaign.name,
        totalRecipients: campaign.recipients.length,
        emailBodies: campaign.emailBodies.length,
        segments: campaign.segments.length,
        deliveryRate: ((successCount / (successCount + failCount)) * 100).toFixed(2) + '%'
      }
    };
  }

  personalizeEmail(content, recipient, companyInfo) {
    return content
      .replace(/\{name\}/g, recipient.name || 'Valued Recipient')
      .replace(/\{email\}/g, recipient.email)
      .replace(/\{company\}/g, recipient.company || 'Your Company')
      .replace(/\{position\}/g, recipient.position || 'Professional')
      .replace(/\{companyName\}/g, companyInfo?.name || 'Final Year Project Demo')
      .replace(/\{firstName\}/g, (recipient.name || '').split(' ')[0] || 'Friend');
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async sendTestEmail(toEmail, subject = 'Test Email from Final Year Project') {
    try {
      const emailData = {
        sender: {
          name: "Final Year Project Demo",
          email: process.env.BREVO_EMAIL
        },
        to: [{
          email: toEmail,
          name: "Test Recipient"
        }],
        subject: subject,
        htmlContent: `
          <h2>🎉 Final Year Project Email System Working!</h2>
          <p>This email was sent using <strong>Brevo HTTP API</strong> - a professional email service!</p>
          <p><strong>Project Features Demonstrated:</strong></p>
          <ul>
            <li>✅ Professional Email API Integration (HTTP REST)</li>
            <li>✅ Contact Management System</li>
            <li>✅ Advanced Segmentation</li>
            <li>✅ Campaign Management</li>
            <li>✅ Real Email Delivery</li>
          </ul>
          <p>Email sent at: ${new Date().toLocaleString()}</p>
          <p><strong>Technical Stack:</strong> React.js, Node.js, MongoDB, Brevo HTTP API</p>
          <hr>
          <small>This demonstrates a complete email marketing system for final year project.</small>
        `,
        textContent: 'Final Year Project Email System - Professional HTTP API Integration Working!'
      };

      const response = await axios.post(this.brevoApiUrl, emailData, {
        headers: this.headers
      });
      
      return { success: true, messageId: response.data.messageId };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message,
        details: error.response?.data
      };
    }
  }
}

module.exports = new EmailService();