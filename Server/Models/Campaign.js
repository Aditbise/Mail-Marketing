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
    enum: ['Draft', 'Ready to Send', 'Scheduled', 'Sent'], 
    default: 'Draft',
    index: true
  },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  openRate: { type: Number, default: 0 },
  clickRate: { type: Number, default: 0 },
  // ========== SCHEDULING FIELDS ==========
  scheduledFor: { 
    type: Date,
    validate: {
      validator: function(value) {
        // Allow null/undefined, or date must be in the future
        if (!value) return true;
        return value > new Date();
      },
      message: 'Scheduled time must be in the future'
    },
    index: true // Index for faster queries on scheduled campaigns
  },
  scheduleMode: {
    type: String,
    enum: ['immediate', 'scheduled'],
    default: 'immediate'
  },
  // ========== TIMESTAMP FIELDS ==========
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

// ========== INDEXES ==========
// Add indexes for frequently queried fields
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ segments: 1 });
campaignSchema.index({ status: 1, scheduledFor: 1 }); // For scheduled campaigns query
campaignSchema.index({ scheduledFor: 1, status: 1 }); // For finding campaigns ready to send

module.exports = mongoose.model('Campaign', campaignSchema);