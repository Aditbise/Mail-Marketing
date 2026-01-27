const mongoose = require('mongoose');

const EmailCampaignSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Campaign name is required'],
    trim: true,
    minlength: [1, 'Campaign name is required'],
    maxlength: [100, 'Campaign name cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    default: '',
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Multi-email body support with sequence tracking
  emailBodies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailBody'
  }],
  
  // Email body sequence order - specifies the order emails are sent to each recipient
  emailBodySequence: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailBody'
  }],
  
  // Multi-segment targeting  
  targetSegments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Segment'
  }],
  
  // Professional email settings
  subject: { 
    type: String, 
    trim: true,
    minlength: [1, 'Subject is required'],
    maxlength: [200, 'Subject cannot exceed 200 characters'],
    default: 'Campaign Email'
  },
  fromName: { 
    type: String, 
    trim: true,
    minlength: [2, 'From name must be at least 2 characters'],
    maxlength: [100, 'From name cannot exceed 100 characters'],
    default: 'Mail Marketing'
  },
  fromEmail: { 
    type: String, 
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    default: 'noreply@example.com'
  },
  replyTo: { 
    type: String,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Reply-to must be a valid email address'],
    default: null
  },
  
  // Advanced status management
  status: { 
    type: String, 
    enum: {
      values: ['Draft', 'Ready to Send', 'Scheduled', 'Sending', 'Sent', 'Paused'],
      message: 'Status must be one of: Draft, Ready to Send, Scheduled, Sending, Sent, Paused'
    },
    default: 'Draft'
  },
  
  // Detailed recipient tracking
  recipients: [{
    _id: false,
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid recipient email'],
      sparse: true
    },
    name: {
      type: String,
      trim: true,
      default: null
    },
    position: {
      type: String,
      trim: true,
      default: null
    },
    company: {
      type: String,
      trim: true,
      default: null
    },
    segmentId: {
      type: String,
      default: null
    },
    segmentName: {
      type: String,
      trim: true,
      default: null
    },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'failed', 'bounced', 'opened', 'clicked', 'active'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: null
    },
    openedAt: {
      type: Date,
      default: null
    },
    clickedAt: {
      type: Date,
      default: null
    },
    trackingId: {
      type: String,
      default: null,
      unique: false
    },
    errorMessage: {
      type: String,
      default: null
    },
    emailSequenceIndex: { 
      type: Number, 
      default: 0,
      min: 0
    }
  }],
  
  // Email analytics
  analytics: {
    opens: { type: Number, default: 0, min: 0 },
    uniqueOpens: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
    uniqueClicks: { type: Number, default: 0, min: 0 },
    bounces: { type: Number, default: 0, min: 0 },
    unsubscribes: { type: Number, default: 0, min: 0 }
  },
  
  // Enhanced tracking
  totalRecipients: { 
    type: Number, 
    default: 0, 
    min: 0
  },
  emailsSent: { 
    type: Number, 
    default: 0,
    min: 0
  },
  emailsFailed: { 
    type: Number, 
    default: 0,
    min: 0
  },
  duplicatesRemoved: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  scheduledAt: { 
    type: Date, 
    default: null
  },
  sentAt: { 
    type: Date, 
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  },
  updatedAt: { 
    type: Date, 
    default: Date.now
  }
}, { 
  timestamps: true // Auto-update createdAt/updatedAt
});

// Add compound indexes for common queries
EmailCampaignSchema.index({ status: 1, createdAt: -1 });
EmailCampaignSchema.index({ status: 1, scheduledAt: 1 });
EmailCampaignSchema.index({ targetSegments: 1, createdAt: -1 });

// Instance methods
EmailCampaignSchema.methods.updateAnalytics = function(updates) {
  if (updates.opens !== undefined) this.analytics.opens = updates.opens;
  if (updates.uniqueOpens !== undefined) this.analytics.uniqueOpens = updates.uniqueOpens;
  if (updates.clicks !== undefined) this.analytics.clicks = updates.clicks;
  if (updates.uniqueClicks !== undefined) this.analytics.uniqueClicks = updates.uniqueClicks;
  if (updates.bounces !== undefined) this.analytics.bounces = updates.bounces;
  if (updates.unsubscribes !== undefined) this.analytics.unsubscribes = updates.unsubscribes;
  return this.save();
};

EmailCampaignSchema.methods.markAsSent = function() {
  this.status = 'Sent';
  this.sentAt = new Date();
  return this.save();
};

EmailCampaignSchema.methods.markAsPaused = function() {
  this.status = 'Paused';
  return this.save();
};

EmailCampaignSchema.methods.getOpenRate = function() {
  if (this.totalRecipients === 0) return 0;
  return (this.analytics.uniqueOpens / this.totalRecipients) * 100;
};

EmailCampaignSchema.methods.getClickRate = function() {
  if (this.totalRecipients === 0) return 0;
  return (this.analytics.uniqueClicks / this.totalRecipients) * 100;
};

// Static methods
EmailCampaignSchema.statics.getDraftCampaigns = function() {
  return this.find({ status: 'Draft' }).sort({ createdAt: -1 });
};

EmailCampaignSchema.statics.getScheduledCampaigns = function() {
  return this.find({ 
    status: 'Scheduled',
    scheduledAt: { $lte: new Date() }
  }).sort({ scheduledAt: 1 });
};

EmailCampaignSchema.statics.getSentCampaigns = function() {
  return this.find({ status: 'Sent' }).sort({ sentAt: -1 });
};

// Pre-save validation
EmailCampaignSchema.pre('save', function(next) {
  // Ensure emailBodySequence matches emailBodies
  if (this.emailBodySequence.length === 0 && this.emailBodies.length > 0) {
    this.emailBodySequence = this.emailBodies;
  }
  
  // Update totalRecipients if recipients array changed
  if (this.recipients.length > 0 && this.totalRecipients === 0) {
    this.totalRecipients = this.recipients.length;
  }
  
  next();
});

module.exports = mongoose.model('EmailCampaign', EmailCampaignSchema);