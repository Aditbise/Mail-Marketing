const mongoose = require('mongoose');

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