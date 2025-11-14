const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailBodies: [{ type: Object }],
  segments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Segment' }],
  recipients: [{ type: Object }],
  companyInfo: { type: Object },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Scheduled'], 
    default: 'Draft' 
  },
  sentCount: { type: Number, default: 0 },
  deliveredCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  sentAt: { type: Date }
});

module.exports = mongoose.model('Campaign', campaignSchema);