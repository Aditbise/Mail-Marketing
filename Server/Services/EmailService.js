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
    let emailSequence = campaign.emailBodies;
    if (campaign.emailBodySequence && campaign.emailBodySequence.length > 0) {
      emailSequence = campaign.emailBodySequence
        .map(bodyId => campaign.emailBodies.find(body => body._id === bodyId || body._id?.toString() === bodyId))
        .filter(Boolean);
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
    let emailCount = 0;
    const totalEmails = campaign.recipients.length * emailSequence.length;

    // Create a flat list of (recipient, emailBody) pairs to send sequentially
    const emailQueue = [];
    for (const recipient of campaign.recipients) {
      for (const emailBody of emailSequence) {
        emailQueue.push({ recipient, emailBody });
      }
    }

    console.log(`\n📊 Email queue created: ${emailQueue.length} total emails to send sequentially`);
    console.log(`   Recipients: ${campaign.recipients.length}, Email Bodies: ${emailSequence.length}`);
    
    // Send each email with 10-second delay between them
    for (const { recipient, emailBody } of emailQueue) {
      emailCount++;
      try {
        console.log(`\n⏱️  [${emailCount}/${totalEmails}] Processing email...`);
        
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
        
        // Nodemailer email payload
        const mailOptions = {
          from: emailBody.fromEmail || process.env.SMTP_FROM || 'noreply@localhost',
          to: recipient.email,
          subject: emailBody.subject || 'Newsletter',
          html: wrappedContent,
          text: this.stripHtml(wrappedContent),
          headers: {
            'List-Unsubscribe': `<mailto:${campaign.companyInfo?.email || 'noreply@localhost'}>`
          }
        };

        console.log(`📤 Sending SMTP email [${emailCount}/${totalEmails}]:`);
        console.log(`   To: ${mailOptions.to}`);
        console.log(`   Subject: ${mailOptions.subject}`);
        console.log(`   Body: ${emailBody.name || 'Untitled'}`);
        
        const info = await this.transporter.sendMail(mailOptions);
        
        console.log(`✅ Email sent successfully!`);
        console.log(`   Message ID: ${info.messageId}`);
        
        results.push({
          email: recipient.email,
          name: recipient.name,
          bodyName: emailBody.name,
          success: true,
          messageId: info.messageId,
          timestamp: new Date()
        });
        
        successCount++;
        
        // Wait 10 seconds before next email (except for the last one)
        if (emailCount < totalEmails) {
          console.log(`⏳ Waiting 10 seconds before next email (${emailCount}/${totalEmails})...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
        
      } catch (error) {
        console.error(`❌ Failed to send email [${emailCount}/${totalEmails}]:`);
        console.error(`   To: ${emailQueue[emailCount - 1].recipient.email}`);
        console.error(`   Error: ${error.message}`);
        
        results.push({
          email: emailQueue[emailCount - 1].recipient.email,
          name: emailQueue[emailCount - 1].recipient.name,
          bodyName: emailQueue[emailCount - 1].emailBody.name,
          success: false,
          error: error.message,
          timestamp: new Date()
        });
        
        failCount++;
        
        // Still wait before next email
        if (emailCount < totalEmails) {
          console.log(`⏳ Waiting 10 seconds before next email despite error...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
    }
    
    console.log(`\n🎯 Campaign completed: ${successCount} success, ${failCount} failed out of ${totalEmails} total`);
    
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
        totalEmails: totalEmails,
        deliveryRate: ((successCount / totalEmails) * 100).toFixed(2) + '%'
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
    // Convert plain text with newlines to HTML with proper formatting
    let htmlBody = emailBody;
    if (typeof emailBody === 'string') {
      // Check if this is plain text (no HTML tags) or already HTML
      const hasHtmlTags = /<[^>]*>/.test(emailBody);
      
      if (!hasHtmlTags) {
        // This is plain text, convert it to HTML with proper line breaks
        htmlBody = emailBody
          .split('\n\n')
          .map(para => {
            // Escape HTML special characters first
            const escaped = para.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // Then convert newlines to <br> tags
            const withBreaks = escaped.replace(/\n/g, '<br/>');
            return `<p style="margin: 16px 0; line-height: 1.6; font-size: 16px; color: #333;">${withBreaks}</p>`;
          })
          .join('');
      }
      // If it already has HTML tags, use it as-is
    }
    
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
      .replace(/\{\{emailBody\}\}/g, htmlBody || '')
      .replace(/\{\{subject\}\}/g, (subject || 'Newsletter').toString().trim())
      .replace(/\{\{companyLogo\}\}/g, logoHtml || '')
      .replace(/\{\{companyName\}\}/g, companyName || '[Company Name]')
      .replace(/\{\{companyEmail\}\}/g, companyEmail || 'contact@company.com')
      .replace(/\{\{companyAddress\}\}/g, addressHtml || '');
    
    return wrappedHtml;
  }

  stripHtml(html) {
    // First, convert escaped HTML entities back to characters
    let text = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    // Convert <br> and <br/> and <br /> tags to newlines
    text = text.replace(/<br\s*\/?>/gi, '\n');
    // Convert </p> tags to double newlines for paragraph breaks
    text = text.replace(/<\/p>/gi, '\n\n');
    // Remove <p> opening tags with any attributes
    text = text.replace(/<p[^>]*>/gi, '');
    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    // Clean up excessive whitespace but preserve intentional line breaks
    text = text.replace(/[ \t]+/g, ' ').trim();
    // Remove excessive blank lines (more than 2 consecutive newlines)
    text = text.replace(/\n\n\n+/g, '\n\n');
    return text;
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