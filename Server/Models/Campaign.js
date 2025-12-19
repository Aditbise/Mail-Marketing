const mongoose = require('mongoose');

<<<<<<< HEAD
const campaignSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  emailBodies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EmailBody'
  }],
  segments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Segment'
  }],
  recipients: [{
    email: { type: String, required: true },
    name: { type: String },
    position: { type: String },
    company: { type: String }
  }],
  companyInfo: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyInfo'
  },
  subject: { type: String },
  fromName: { type: String },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Ready to Send', 'Sent', 'Scheduled'], 
    default: 'Draft',
    index: true
  },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  openRate: { type: Number, default: 0 },
  clickRate: { type: Number, default: 0 },
  scheduledFor: Date,
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  sentAt: { type: Date }
}, { timestamps: true });

// Add indexes for frequently queried fields
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ segments: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
=======
const CampaignSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        default: '',
        trim: true
    },
    status: { 
        type: String, 
        enum: ['Draft', 'Sent', 'Scheduled'], 
        default: 'Draft' 
    },
    emailBodies: [{
        emailBodyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EmailBody',
            required: true
        },
        name: String,
        bodyContent: String
    }],
    sentTo: [{
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'EmailList'
        },
        name: String,
        email: String,
        company: String,
        position: String,
        sentAt: {
            type: Date,
            default: Date.now
        }
    }],
    sentCount: {
        type: Number,
        default: 0
    },
    sentAt: {
        type: Date
    },
    scheduledAt: {
        type: Date
    },
    createdBy: {
        type: String,
        default: 'system'
    },
    campaignMetrics: {
        totalSent: { type: Number, default: 0 },
        delivered: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        clicked: { type: Number, default: 0 },
        bounced: { type: Number, default: 0 }
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for better query performance
CampaignSchema.index({ status: 1, createdAt: -1 });
CampaignSchema.index({ name: 1 });

module.exports = mongoose.model('Campaign', CampaignSchema);
>>>>>>> 416159759af96fd6470c8fb1dd31e6faa0577531
