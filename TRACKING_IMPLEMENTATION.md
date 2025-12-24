# Email Template Interest Tracking System

## Overview
Track recipient engagement with your email templates to determine if they're interested, engaged, or not interested.

## Implementation Summary

### ✅ What Was Added

#### 1. **Frontend Updates** (EmailBodyEditor.jsx)
- Engagement metrics display in template preview card
- Opens, clicks, click rate, interested count displayed
- Opens and clicks columns added to templates table
- New helper functions: `generateTrackingPixel()`, `wrapTrackingLink()`

#### 2. **Backend Tracking** (tracking-endpoints.js)
- `/track/open/:templateId/:recipientEmail` - Pixel endpoint for opens
- `/track/click/:templateId/:recipientEmail?redirect=URL` - Click tracking
- `/template-engagement/:templateId` - Get engagement stats
- `/template-recipients/:templateId` - Get detailed recipient engagement data

#### 3. **Recipient Engagement Viewer** (RecipientEngagementViewer.jsx)
- Detailed view of all recipients
- Filter by interest level (interested, engaged, not interested)
- Timeline of opens/clicks per recipient
- Interest level badges with color coding

## How It Works

### Open Tracking (Pixel)
1. A 1x1 invisible pixel is added to email footer
2. When recipient opens email → pixel loads from your server
3. Server logs: templateId, recipientEmail, timestamp, IP, userAgent
4. Result: You know WHO opened WHEN

### Click Tracking
1. All links in email are wrapped with tracking URLs
2. When recipient clicks → server logs and redirects
3. Server logs: templateId, recipientEmail, linkClicked, timestamp
4. Result: You know WHO clicked WHICH links

### Interest Scoring
```
❌ NOT_INTERESTED   = Never opened email
👀 ENGAGED         = Opened but didn't click
🔥 VERY_INTERESTED = Opened AND clicked
```

## Implementation Checklist

### Step 1: Update Backend (Server)
- [ ] Add tracking-endpoints.js routes to your Express app
- [ ] Update EmailTemplate MongoDB schema to include engagementStats
- [ ] Create Engagement model for storing tracking data

### Step 2: Frontend Integration
- [ ] EmailBodyEditor.jsx already updated with engagement display
- [ ] Add RecipientEngagementViewer component to your app
- [ ] Use `generateTrackingPixel()` when sending emails
- [ ] Use `wrapTrackingLink()` when sending emails

### Step 3: Email Sending Integration (When Using Brevo API)
```javascript
// Example: When sending email via Brevo
const contentWithTracking = template.content + 
  generateTrackingPixel(template._id, recipientEmail);

const contentWithLinks = contentWithTracking.replace(
  /href="([^"]*)"/g,
  (match, url) => `href="${wrapTrackingLink(url, template._id, recipientEmail)}"`
);

// Send contentWithLinks via Brevo API
```

### Step 4: Display Engagement Data
- [ ] Template list shows opens/clicks columns
- [ ] Template preview shows engagement stats card
- [ ] RecipientEngagementViewer shows detailed recipient data

## Database Schema Required

### Engagement Collection
```javascript
{
  templateId: String,
  recipientEmail: String,
  eventType: 'open' | 'click',
  linkClicked: String (optional),
  timestamp: Date,
  userAgent: String,
  ipAddress: String
}
```

### EmailTemplate Update
```javascript
engagementStats: {
  opens: Number,
  clicks: Number,
  interestedCount: Number,
  openRate: String  // e.g., "23%"
}
```

## API Endpoints Reference

### Get Template Engagement Stats
```
GET /template-engagement/:templateId

Response:
{
  opens: 150,
  clicks: 45,
  uniqueClicks: 35,
  interestedCount: 35,
  openRate: "23%"
}
```

### Get Recipient Details
```
GET /template-recipients/:templateId

Response:
{
  total: 150,
  interested: 35,      // clicked
  engaged: 100,        // opened but didn't click
  notInterested: 50,   // never opened
  recipients: [
    {
      email: "john@example.com",
      opened: true,
      clicked: true,
      lastActivity: "2025-12-24T10:30:00Z",
      events: [...]
    }
  ]
}
```

## Frontend Usage

### Display Engagement Stats in Template List
✅ Already implemented in EmailBodyEditor.jsx
- Opens column
- Clicks column
- Engagement metrics card

### View Recipient Details
```javascript
import RecipientEngagementViewer from './RecipientEngagementViewer';

// In your component:
<RecipientEngagementViewer 
  templateId={template._id}
  templateName={template.name}
  onClose={() => {}}
/>
```

## Important Notes

### ⚠️ Privacy & Compliance
- Get consent before tracking emails
- Add unsubscribe links (required by law)
- Store minimal data
- Comply with GDPR/CAN-SPAM

### 📊 Email Client Support
- Some clients block pixel tracking (Gmail, Outlook)
- Click tracking is more reliable
- Combine both for best results

### 🚀 Performance Optimization
- Log async to not slow down redirects
- Index templateId, recipientEmail in database
- Use CDN for tracking pixel (optional)

### 🎯 Accuracy Tips
- Filter bot opens (check user-agent)
- Handle duplicate opens (use timestamps)
- Focus on clicks (most reliable metric)

## Next Steps

1. **Add to Server**: Copy tracking-endpoints.js routes
2. **Update Models**: Add engagementStats to EmailTemplate
3. **Email Integration**: Add tracking when sending via Brevo
4. **Display**: Use RecipientEngagementViewer component
5. **Monitor**: Track engagement metrics over time

## Example: Viewing Interest Metrics

```javascript
// In your campaign management page:
const recipients = await fetchRecipientData(templateId);

recipients.forEach(recipient => {
  if (recipient.clicked) {
    console.log(`🔥 ${recipient.email} - VERY INTERESTED (clicked)`);
  } else if (recipient.opened) {
    console.log(`👀 ${recipient.email} - ENGAGED (opened only)`);
  } else {
    console.log(`❌ ${recipient.email} - NOT INTERESTED (never opened)`);
  }
});
```

---

**Status**: ✅ Frontend components ready, Backend endpoints provided, Ready for integration
