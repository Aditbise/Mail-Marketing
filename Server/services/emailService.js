const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            this.transporter = nodemailer.createTransport(emailConfig.smtp);
            
            // Verify connection configuration
            await this.transporter.verify();
            console.log('✅ Email service initialized successfully');
            console.log('📧 Ready to send emails via Gmail SMTP');
        } catch (error) {
            console.error('❌ Email service initialization failed:', error.message);
            console.log('⚠️  Please check your Gmail configuration in config/emailConfig.js');
            console.log('⚠️  Make sure you have:');
            console.log('   1. Enabled 2-factor authentication');
            console.log('   2. Generated an app-specific password');
            console.log('   3. Updated emailConfig.js with your credentials');
        }
    }

    async sendCampaignEmail(recipient, campaign, emailBody) {
        if (!this.transporter) {
            throw new Error('Email service not initialized. Please check your Gmail configuration.');
        }

        try {
            // Replace template variables
            const subject = emailConfig.templates.campaignEmail.subject
                .replace('{{campaignName}}', campaign.name);

            const htmlContent = emailConfig.templates.campaignEmail.html
                .replace('{{campaignName}}', campaign.name)
                .replace('{{campaignDescription}}', campaign.description || 'No description')
                .replace('{{emailContent}}', this.formatEmailContent(emailBody.bodyContent))
                .replace('{{sentDate}}', new Date().toLocaleDateString());

            const mailOptions = {
                from: `${emailConfig.from.name} <${emailConfig.from.email}>`,
                to: recipient.email,
                subject: subject,
                html: htmlContent,
                text: this.htmlToText(emailBody.bodyContent) // Fallback text version
            };

            console.log(`📧 Sending email to: ${recipient.name} (${recipient.email})`);
            console.log(`📄 Subject: ${subject}`);
            
            const result = await this.transporter.sendMail(mailOptions);
            
            console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`);
            
            return {
                success: true,
                messageId: result.messageId,
                recipient: recipient.email
            };

        } catch (error) {
            console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
            
            return {
                success: false,
                error: error.message,
                recipient: recipient.email
            };
        }
    }

    async sendCampaignToMultipleRecipients(recipients, campaign) {
        const results = [];
        
        console.log(`\n=== SENDING CAMPAIGN "${campaign.name}" ===`);
        console.log(`📬 Recipients: ${recipients.length}`);
        console.log(`📄 Email Bodies: ${campaign.emailBodies.length}`);
        
        for (const recipient of recipients) {
            console.log(`\n--- Processing recipient: ${recipient.name} ---`);
            
            // Send each email body to the recipient
            for (const emailBody of campaign.emailBodies) {
                console.log(`📝 Sending email body: "${emailBody.Name || 'Untitled'}"`);
                
                const result = await this.sendCampaignEmail(recipient, campaign, emailBody);
                results.push({
                    ...result,
                    recipientName: recipient.name,
                    emailBodyName: emailBody.Name || 'Untitled'
                });
                
                // Add delay between emails to avoid rate limiting
                await this.delay(1000); // 1 second delay
            }
        }
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        console.log(`\n=== CAMPAIGN SEND SUMMARY ===`);
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${results.length}`);
        
        return {
            results,
            summary: {
                total: results.length,
                successful,
                failed
            }
        };
    }

    formatEmailContent(content) {
        if (!content) return '<p>No content available</p>';
        
        // Convert line breaks to HTML
        return content.replace(/\n/g, '<br>');
    }

    htmlToText(html) {
        if (!html) return 'No content available';
        
        // Simple HTML to text conversion
        return html.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').trim();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async testConnection() {
        try {
            if (!this.transporter) {
                throw new Error('Email service not initialized');
            }
            
            await this.transporter.verify();
            console.log('✅ Gmail SMTP connection test successful');
            return { success: true };
        } catch (error) {
            console.error('❌ Gmail SMTP connection test failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();