const mongoose = require('mongoose');

const EmailCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  
  // NEW: Multi-email body support
  emailBodies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailBody' 
  }],
  
  // NEW: Multi-segment targeting  
  targetSegments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Segment' 
  }],
  
  // NEW: Professional email settings
  subject: { type: String, required: true },
  fromName: { type: String, required: true },
  fromEmail: { type: String, required: true },
  replyTo: { type: String },
  
  // NEW: Advanced status management
  status: { 
    type: String, 
    enum: ['Draft', 'Scheduled', 'Sending', 'Sent', 'Paused'], 
    default: 'Draft' 
  },
  
  // NEW: Detailed recipient tracking
  recipients: [{
    email: String,
    name: String,
    position: String,
    company: String,
    segmentId: String,
    segmentName: String,
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'failed', 'bounced'],
      default: 'pending'
    },
    sentAt: Date,
    trackingId: String,
    errorMessage: String
  }],
  
  // NEW: Email analytics
  analytics: {
    opens: { type: Number, default: 0 },
    uniqueOpens: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    uniqueClicks: { type: Number, default: 0 },
    bounces: { type: Number, default: 0 }
  },
  
  // Enhanced tracking
  totalRecipients: { type: Number, default: 0 },
  emailsSent: { type: Number, default: 0 },
  emailsFailed: { type: Number, default: 0 },
  duplicatesRemoved: { type: Number, default: 0 },
  
  scheduledAt: { type: Date },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);