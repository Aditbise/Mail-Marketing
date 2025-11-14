const mongoose = require('mongoose');

const EmailTrackingSchema = new mongoose.Schema({
  campaignId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailCampaign',
    required: true,
    index: true  // Only define index here, not in schema.index() below
  },
  recipientEmail: { type: String, required: true },
  trackingId: { 
    type: String, 
    required: true, 
    unique: true  // This creates an index automatically
  },
  
  events: [{
    type: { 
      type: String, 
      enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String,
    clickedUrl: String,
    location: {
      country: String,
      city: String,
      region: String
    }
  }],
  
  firstOpened: Date,
  lastOpened: Date,
  totalOpens: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now }
});

// Only add indexes that aren't already defined above
EmailTrackingSchema.index({ recipientEmail: 1 });
EmailTrackingSchema.index({ 'events.type': 1 });
// Remove duplicate trackingId index since it's already unique above

module.exports = mongoose.model('EmailTracking', EmailTrackingSchema);