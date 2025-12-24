// Email Tracking Endpoints - Add these to your Express server

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Engagement Tracking Schema
const engagementSchema = new mongoose.Schema({
  templateId: String,
  recipientEmail: String,
  eventType: { type: String, enum: ['open', 'click'] },
  linkClicked: String,
  timestamp: { type: Date, default: Date.now },
  userAgent: String,
  ipAddress: String
});

const Engagement = mongoose.model('Engagement', engagementSchema);

// Track Email Open (Pixel endpoint)
router.get('/track/open/:templateId/:recipientEmail', async (req, res) => {
  try {
    const { templateId, recipientEmail } = req.params;
    
    // Log the open event
    await Engagement.create({
      templateId,
      recipientEmail: decodeURIComponent(recipientEmail),
      eventType: 'open',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Update template engagement stats
    await updateTemplateStats(templateId);

    // Return 1x1 transparent pixel
    res.type('image/gif');
    res.send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  } catch (error) {
    console.error('Error tracking open:', error);
    res.status(500).send('Tracking error');
  }
});

// Track Link Clicks
router.get('/track/click/:templateId/:recipientEmail', async (req, res) => {
  try {
    const { templateId, recipientEmail } = req.params;
    const { redirect } = req.query;

    // Log the click event
    await Engagement.create({
      templateId,
      recipientEmail: decodeURIComponent(recipientEmail),
      eventType: 'click',
      linkClicked: redirect,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    });

    // Update template engagement stats
    await updateTemplateStats(templateId);

    // Redirect to original URL
    if (redirect) {
      res.redirect(decodeURIComponent(redirect));
    } else {
      res.status(400).send('No redirect URL provided');
    }
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).send('Tracking error');
  }
});

// Get Engagement Analytics for a Template
router.get('/template-engagement/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;

    // Get all engagement events for this template
    const engagements = await Engagement.find({ templateId });

    // Calculate stats
    const uniqueOpens = new Set(
      engagements.filter(e => e.eventType === 'open').map(e => e.recipientEmail)
    ).size;

    const uniqueClicks = new Set(
      engagements.filter(e => e.eventType === 'click').map(e => e.recipientEmail)
    ).size;

    const totalEvents = engagements.length;
    const interestedCount = uniqueClicks; // People who clicked are interested

    res.json({
      opens: uniqueOpens,
      clicks: totalEvents - uniqueOpens, // Total click events
      uniqueClicks: uniqueClicks, // Unique people who clicked
      interestedCount: interestedCount,
      openRate: uniqueOpens > 0 ? `${Math.round((uniqueClicks / uniqueOpens) * 100)}%` : '0%',
      engagementTimeline: engagements
    });
  } catch (error) {
    console.error('Error fetching engagement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Recipient Details (who is interested/disinterested)
router.get('/template-recipients/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;

    const engagements = await Engagement.find({ templateId }).sort({ timestamp: -1 });

    // Group by recipient
    const recipientMap = {};
    engagements.forEach(event => {
      if (!recipientMap[event.recipientEmail]) {
        recipientMap[event.recipientEmail] = {
          email: event.recipientEmail,
          opened: false,
          clicked: false,
          lastActivity: event.timestamp,
          events: []
        };
      }
      recipientMap[event.recipientEmail].events.push(event);
      if (event.eventType === 'open') {
        recipientMap[event.recipientEmail].opened = true;
      }
      if (event.eventType === 'click') {
        recipientMap[event.recipientEmail].clicked = true;
      }
    });

    // Convert to array and sort by interest level
    const recipients = Object.values(recipientMap).sort((a, b) => {
      const aInterest = a.clicked ? 2 : (a.opened ? 1 : 0);
      const bInterest = b.clicked ? 2 : (b.opened ? 1 : 0);
      return bInterest - aInterest;
    });

    res.json({
      total: recipients.length,
      interested: recipients.filter(r => r.clicked).length,
      engaged: recipients.filter(r => r.opened).length,
      notInterested: recipients.filter(r => !r.opened).length,
      recipients: recipients
    });
  } catch (error) {
    console.error('Error fetching recipient details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update template engagement stats
async function updateTemplateStats(templateId) {
  try {
    const engagements = await Engagement.find({ templateId });
    
    const opens = new Set(
      engagements.filter(e => e.eventType === 'open').map(e => e.recipientEmail)
    ).size;

    const clicks = engagements.filter(e => e.eventType === 'click').length;
    const uniqueClicks = new Set(
      engagements.filter(e => e.eventType === 'click').map(e => e.recipientEmail)
    ).size;

    // Update the template with engagement stats
    // This assumes you have an EmailTemplate model
    // const Template = mongoose.model('EmailTemplate');
    // await Template.findByIdAndUpdate(templateId, {
    //   engagementStats: {
    //     opens,
    //     clicks,
    //     interestedCount: uniqueClicks,
    //     openRate: opens > 0 ? `${Math.round((uniqueClicks / opens) * 100)}%` : '0%'
    //   }
    // });
  } catch (error) {
    console.error('Error updating template stats:', error);
  }
}

module.exports = router;
