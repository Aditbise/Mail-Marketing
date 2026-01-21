const nodemailer = require('nodemailer');

// HTML Email Template
const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>{{subject}}</title>
</head>
<body style="margin:0; padding:0; background-color:#eeeeee; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eeeeee; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden; border:1px solid #dddddd;">

          <!-- Header with Logo -->
          <tr>
            <td style="background-color:#f9f9f9; padding:20px; text-align:center; border-bottom:1px solid #e0e0e0;">
              {{companyLogo}}
              <div style="font-size:18px; font-weight:bold; color:#333333; margin-top:10px;">
                {{companyName}}
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:30px 20px; font-size:14px; color:#333333; line-height:1.6;">
              {{emailBody}}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f0f0f0; padding:20px; text-align:center; font-size:11px; color:#666666; border-top:1px solid #e0e0e0;">

              <!-- Company Details -->
              <div style="line-height:1.8; margin-bottom:15px;">
                <strong>{{companyName}}</strong><br/>
                <a href="mailto:{{companyEmail}}" style="color:#0066cc; text-decoration:none;">{{companyEmail}}</a><br/>
                {{companyAddress}}
              </div>

              <!-- Copyright -->
              <div style="margin-top:10px; font-size:10px; color:#999999;">
                © 2026 {{companyName}}. All rights reserved.
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

class EmailService {
  constructor() {
    // Local SMTP configuration (Mailhog)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 1025,
      secure: false, // false for Mailhog on port 1025
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined
    });
    
    // Log configuration on startup
    console.log('🔧 EmailService Initialized:');
    console.log(`   SMTP Host: ${process.env.SMTP_HOST || 'localhost'}`);
    console.log(`   SMTP Port: ${process.env.SMTP_PORT || 1025}`);
    console.log(`   Sender Email: ${process.env.SMTP_FROM || 'noreply@localhost'}`);
    console.log(`   📬 Mailhog Web UI: http://localhost:8025`);
  }

  async sendCampaignEmails(campaign) {
    console.log(`🚀 Starting campaign: ${campaign.name}`);
    console.log(`📧 Sending to ${campaign.recipients.length} recipients via Local SMTP (Mailhog)`);
    
    // Log company info being used
    console.log('📋 Company Info in Campaign:', {
      name: campaign.companyInfo?.name || 'Not available',
      email: campaign.companyInfo?.email || 'Not available',
      hasCompanyInfo: !!campaign.companyInfo
    });
    
    // Use emailBodySequence if available (respects user's email order)
    // emailBodySequence contains IDs, so map them back to the full emailBodies objects
    let emailSequence = campaign.emailBodies;
    if (campaign.emailBodySequence && campaign.emailBodySequence.length > 0) {
      // emailBodySequence is an array of IDs - map them to the full email body objects
      emailSequence = campaign.emailBodySequence
        .map(bodyId => campaign.emailBodies.find(body => body._id === bodyId || body._id?.toString() === bodyId))
        .filter(Boolean); // Remove any null/undefined entries
      console.log(`📋 Using email sequence: YES (from user selection) - mapped ${campaign.emailBodySequence.length} IDs to ${emailSequence.length} email bodies`);
    } else {
      console.log(`📋 Using email sequence: NO (using default order)`);
    }
    
    console.log(`📝 Email bodies count: ${emailSequence.length}`);
    
    if (emailSequence.length > 0) {
      console.log('📝 Email sequence order:', {
        count: emailSequence.length,
        names: emailSequence.map((body, idx) => `${idx + 1}. ${body.name || 'Untitled'}`).join(' → ')
      });
    }
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const recipient of campaign.recipients) {
      // Send each email in the sequence to the recipient
      for (let sequenceIndex = 0; sequenceIndex < emailSequence.length; sequenceIndex++) {
        const emailBody = emailSequence[sequenceIndex];
        try {
          const personalizedContent = this.personalizeEmail(
            emailBody.content, 
            recipient, 
            campaign.companyInfo
          );

          // Wrap in professional HTML template
          const wrappedContent = this.wrapInTemplate(
            personalizedContent,
            campaign.companyInfo,
            emailBody.subject
          );
          console.log(`  Body: ${emailBody.name || 'Untitled'}`);
          console.log(`Content type: ${typeof personalizedContent}`);
          console.log(`Content length: ${personalizedContent.length}`);
          console.log(`First 200 chars: ${personalizedContent.substring(0, 200)}`);
          console.log(`Contains HTML tags: ${/<[^>]+>/.test(personalizedContent)}`);
          
          // Nodemailer email payload
          const mailOptions = {
            from: emailBody.fromEmail || process.env.SMTP_FROM || 'noreply@localhost',
            to: recipient.email,
            subject: emailBody.subject || 'Newsletter',
            html: wrappedContent,
            text: this.stripHtml(personalizedContent),
            // Add headers for better email structure
            headers: {
              'List-Unsubscribe': `<mailto:${campaign.companyInfo?.email || 'noreply@localhost'}>`
            }
          };

          console.log(`\n📤 Sending SMTP email:`);
          console.log(`  To: ${mailOptions.to}`);
          console.log(`  From: ${mailOptions.from}`);
          console.log(`  Subject: ${mailOptions.subject}`);
          console.log(`  HTML Content Length: ${mailOptions.html.length}`);
          console.log(`  Has HTML: ${mailOptions.html.includes('<')}`);
          
          const info = await this.transporter.sendMail(mailOptions);
          
          console.log(`✅ SMTP Response:`);
          console.log(`✅ Message ID: ${info.messageId}`);
          console.log(`✅ Accepted: ${info.accepted}`);
          
          results.push({
            email: recipient.email,
            name: recipient.name,
            success: true,
            messageId: info.messageId,
            timestamp: new Date()
          });
          
          successCount++;
          console.log(`✅ Sent successfully to: ${recipient.email} (ID: ${info.messageId})\n`);
          
          // Small delay to be respectful to API
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Failed to send to ${recipient.email}:`);
          console.error(`   Status: ${error.response?.status}`);
          console.error(`   Error Data: ${JSON.stringify(error.response?.data)}`);
          console.error(`   Message: ${error.message}`);
          results.push({
            email: recipient.email,
            name: recipient.name,
            success: false,
            error: error.response?.data?.message || error.message,
            errorDetails: error.response?.data,
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
        totalRecipients: campaign.recipients?.length || 0,
        emailBodies: campaign.emailBodies?.length || 0,
        segments: campaign.targetSegments?.length || campaign.segments?.length || 0,
        deliveryRate: ((successCount / (successCount + failCount)) * 100).toFixed(2) + '%'
      }
    };
  }

  personalizeEmail(content, recipient, companyInfo) {
    // Handle undefined or null content
    if (!content) {
      console.warn('⚠️  Email content is undefined/null, using default message');
      content = '<p>No content provided</p>';
    }
    
    // Handle companyInfo - ensure it's an object, not a string
    let company = companyInfo;
    if (typeof companyInfo === 'string') {
      try {
        company = JSON.parse(companyInfo);
      } catch (e) {
        company = { name: companyInfo };
      }
    }
    if (!company || typeof company !== 'object') {
      company = {};
    }
    
    // Use companyInfo from database, fallback to placeholder if not available
    const companyName = (company.companyName || company.name || '[Company Name]').toString().trim();
    
    return content
      .replace(/\{name\}/g, (recipient.name || 'Valued Recipient').toString())
      .replace(/\{email\}/g, (recipient.email || '').toString())
      .replace(/\{company\}/g, (recipient.company || 'Your Company').toString())
      .replace(/\{position\}/g, (recipient.position || 'Professional').toString())
      .replace(/\{companyName\}/g, companyName)
      .replace(/\{firstName\}/g, ((recipient.name || '').split(' ')[0] || 'Friend').toString());
  }

  wrapInTemplate(emailBody, companyInfo, subject) {
    // Use company info if available, otherwise use placeholders
    const company = companyInfo || {};
    
    // Build company logo HTML if available
    let logoHtml = '';
    if (company.logo) {
      // Construct absolute URL for logo - emails need full URLs to load images
      let logoUrl = company.logo;
      if (!logoUrl.startsWith('http')) {
        // If it's a relative path like /uploads/logo.jpg, make it absolute
        logoUrl = `http://localhost:3001${logoUrl}`;
      }
      console.log('🖼️ Logo URL constructed:', logoUrl);
      logoHtml = `<img src="${logoUrl}" alt="Company Logo" style="max-height:60px; max-width:200px; margin-bottom:10px;" />`;
    } else {
      console.log('⚠️ No logo found in company info. Logo path:', company.logo);
    }

    // Build company address if available
    let addressHtml = '';
    if (company.address || company.street1 || company.street2) {
      let addr = company.address;
      
      // If address is an object, skip it. Only accept strings.
      if (typeof addr !== 'string') {
        addr = '';
      }
      
      // If no address string, try building from street fields
      if (!addr) {
        const street1 = typeof company.street1 === 'string' ? company.street1 : '';
        const street2 = typeof company.street2 === 'string' ? company.street2 : '';
        addr = `${street1} ${street2}`.trim();
      }
      
      if (addr && typeof addr === 'string') {
        addressHtml = `<span>${addr}</span><br/>`;
      }
    }

    // Get proper company name (use companyName field if available, fallback to name)
    const companyName = (company.companyName || company.name || '[Company Name Not Set]').toString().trim();
    const companyEmail = (company.email || company.companyEmail || 'contact@company.com').toString().trim();

    console.log('🎨 Template Wrapping - Company Info:', {
      name: companyName,
      email: companyEmail,
      hasLogo: !!logoHtml,
      hasAddress: !!addressHtml,
      companyType: typeof company,
      companyKeys: Object.keys(company).slice(0, 5)
    });

    // Wrap in template and replace all placeholders
    let wrappedHtml = EMAIL_TEMPLATE
      .replace(/\{\{emailBody\}\}/g, emailBody || '')
      .replace(/\{\{subject\}\}/g, (subject || 'Newsletter').toString().trim())
      .replace(/\{\{companyLogo\}\}/g, logoHtml || '')
      .replace(/\{\{companyName\}\}/g, companyName || '[Company Name]')
      .replace(/\{\{companyEmail\}\}/g, companyEmail || 'contact@company.com')
      .replace(/\{\{companyAddress\}\}/g, addressHtml || '');
    
    return wrappedHtml;
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  async sendTestEmail(toEmail, subject = 'Test Email') {
    try {
      const testContent = `
        <h2>🎉 Final Year Project Email System Working!</h2>
        <p>This email was sent using <strong>Local SMTP Server (Mailhog)</strong> for testing!</p>
        <p><strong>Project Features Demonstrated:</strong></p>
        <ul>
          <li>✅ Local SMTP Integration for Testing</li>
          <li>✅ Contact Management System</li>
          <li>✅ Advanced Segmentation</li>
          <li>✅ Campaign Management</li>
          <li>✅ Email Delivery Testing</li>
        </ul>
        <p>Email sent at: ${new Date().toLocaleString()}</p>
        <p><strong>Technical Stack:</strong> React.js, Node.js, MongoDB, Local SMTP (Mailhog)</p>
        <p>📬 <strong>Check Mailhog UI:</strong> <a href="http://localhost:8025">http://localhost:8025</a></p>
      `;

      // Wrap in template for professional look
      const wrappedContent = this.wrapInTemplate(
        testContent,
        { name: 'Final Year Project', email: process.env.SMTP_FROM },
        subject
      );

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@localhost',
        to: toEmail,
        subject: subject,
        html: wrappedContent,
        text: 'Final Year Project Email System - Local SMTP Testing Working!'
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return { success: true, messageId: info.messageId, accepted: info.accepted };
      
    } catch (error) {
      return { 
        success: false, 
        error: error.message,
        details: error
      };
    }
  }
}

module.exports = new EmailService();