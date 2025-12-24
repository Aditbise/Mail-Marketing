// EMAIL TRACKING IMPLEMENTATION GUIDE
// ===================================

/*
HOW TRACKING WORKS:

1. OPEN TRACKING (Pixel)
   - A 1x1 invisible pixel is added to email footer
   - When recipient opens email, pixel loads from your server
   - Server logs: templateId, recipientEmail, timestamp, IP, userAgent
   - Result: You know WHO opened the email and WHEN

2. CLICK TRACKING
   - All links in email are wrapped with tracking URLs
   - When recipient clicks, server logs the click
   - Server redirects to original URL
   - Result: You know WHO clicked WHICH links

3. INTEREST SCORING
   - Not Interested: Never opened
   - Somewhat Interested: Opened but didn't click
   - Very Interested: Opened AND clicked
*/

// ===== INTEGRATION STEPS =====

// STEP 1: Add tracking routes to your main Express server (app.js or server.js)
// const trackingRoutes = require('./tracking-endpoints');
// app.use('/track', trackingRoutes);

// STEP 2: Update EmailTemplate Model to include engagementStats
// In your MongoDB schema, add:
// engagementStats: {
//   opens: { type: Number, default: 0 },
//   clicks: { type: Number, default: 0 },
//   interestedCount: { type: Number, default: 0 },
//   openRate: { type: String, default: '0%' }
// }

// STEP 3: When sending emails via Brevo API, add tracking pixel to content
// Example in campaign sending code:
// const templateWithTracking = template.content + generateTrackingPixel(templateId, recipientEmail);

// STEP 4: Wrap all links with tracking URLs
// Example:
// const contentWithTracking = template.content.replace(
//   /href="([^"]*)"/g,
//   (match, url) => `href="${wrapTrackingLink(url, templateId, recipientEmail)}"`
// );

// ===== USAGE IN FRONTEND =====

// To add tracking to an email template in EmailBodyEditor:

const addTrackingToTemplate = (template, templateId) => {
  /*
  Example: When preparing email content
  
  1. Get the template content
  2. Add tracking pixel to footer
  3. Wrap all links with tracking URLs
  4. Send to email service (Brevo)
  */
};

// ===== API ENDPOINTS =====

/*
GET /track/open/:templateId/:recipientEmail
  - Called by email pixel
  - Records email open
  - Returns 1x1 transparent GIF
  - Response: Image

GET /track/click/:templateId/:recipientEmail?redirect=URL
  - Called when recipient clicks tracked link
  - Records click event
  - Redirects to original URL
  - Response: Redirect to original URL

GET /template-engagement/:templateId
  - Get engagement stats for a template
  - Returns: opens, clicks, interested count, open rate
  - Response: {
      opens: 150,
      clicks: 45,
      uniqueClicks: 35,
      interestedCount: 35,
      openRate: "23%"
    }

GET /template-recipients/:templateId
  - Get detailed recipient engagement
  - Returns all recipients sorted by interest level
  - Response: {
      total: 150,
      interested: 35,     // clicked
      engaged: 100,       // opened
      notInterested: 50,  // never opened
      recipients: [...]
    }
*/

// ===== EXAMPLE: Determining Interest Level =====

const determineInterest = (recipientData) => {
  if (!recipientData.opened) {
    return { level: 'NOT_INTERESTED', emoji: '❌', color: 'red' };
  }
  if (recipientData.clicked) {
    return { level: 'VERY_INTERESTED', emoji: '🔥', color: 'green' };
  }
  if (recipientData.opened) {
    return { level: 'SOMEWHAT_INTERESTED', emoji: '👀', color: 'orange' };
  }
};

// ===== EXAMPLE: Frontend Display =====

// In your campaign management page:
// Show each recipient with:
// - Email address
// - Open status (opened/not opened)
// - Click status (clicked/not clicked)
// - Interest level badge
// - Timeline of opens/clicks

// Example recipient data:
/*
{
  email: "john@example.com",
  opened: true,
  clicked: true,
  lastActivity: "2025-12-24T10:30:00Z",
  interestLevel: "VERY_INTERESTED",
  events: [
    { eventType: 'open', timestamp: "2025-12-24T10:00:00Z" },
    { eventType: 'click', timestamp: "2025-12-24T10:15:00Z", linkClicked: "https://..." }
  ]
}
*/

// ===== IMPORTANT NOTES =====

/*
1. GDPR/Privacy Compliance:
   - Always get consent before tracking emails
   - Add unsubscribe links
   - Store minimal data (no passwords, sensitive info)
   - Allow users to opt-out of tracking

2. Email Client Support:
   - Some email clients block pixel tracking (Gmail, Outlook)
   - Click tracking is more reliable
   - Combine both for best results

3. Performance:
   - Use CDN for tracking pixel
   - Log async to not slow down redirects
   - Index templateId, recipientEmail in database

4. Accuracy:
   - Filter bots/spam opens (check user-agent)
   - Handle multiple opens (use timestamps)
   - Track actual engagement, not just opens
*/

module.exports = { addTrackingToTemplate, determineInterest };
