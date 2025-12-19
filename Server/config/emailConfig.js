// Email configuration for Gmail SMTP
// To use this, you need to:
// 1. Enable 2-factor authentication on your Gmail account
// 2. Generate an app-specific password: https://myaccount.google.com/apppasswords
// 3. Update the values below with your Gmail credentials

module.exports = {
    // Gmail SMTP Configuration
    smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.GMAIL_USER || 'your-email@gmail.com', // Replace with your Gmail address
            pass: process.env.GMAIL_PASS || 'your-app-password'     // Replace with your Gmail app password (not regular password)
        }
    },
    
    // Default sender info
    from: {
        name: 'Mail Marketing Campaign',
        email: process.env.GMAIL_USER || 'your-email@gmail.com' // Replace with your Gmail address
    },
    
    // Email templates
    templates: {
        campaignEmail: {
            subject: 'Campaign: {{campaignName}}',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                        {{campaignName}}
                    </h2>
                    <div style="padding: 20px 0;">
                        {{emailContent}}
                    </div>
                    <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px; font-size: 12px; color: #666;">
                        <p><strong>Campaign Details:</strong></p>
                        <p>Description: {{campaignDescription}}</p>
                        <p>Sent on: {{sentDate}}</p>
                        <p>This email was sent as part of our email marketing campaign.</p>
                    </div>
                </div>
            `
        }
    }
};

// IMPORTANT SETUP INSTRUCTIONS:
// 1. Go to https://myaccount.google.com/security
// 2. Enable 2-Step Verification
// 3. Go to https://myaccount.google.com/apppasswords
// 4. Generate an app password for "Mail"
// 5. Replace 'your-email@gmail.com' with your actual Gmail address
// 6. Replace 'your-app-password' with the generated app password