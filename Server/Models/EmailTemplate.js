const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  fromName: {
    type: String,
    required: true,
    trim: true
  },
  fromEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  signature: {
    type: String,
    default: ''
  },
  layout: {
    type: String,
    enum: ['modern', 'minimal', 'classic'],
    default: 'modern'
  },
  preview: {
    type: String,
    default: ''
  },
  heroImage: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['promotional', 'transactional', 'newsletter', 'notification'],
    default: 'promotional'
  },
  tags: [String],
  replyTo: { type: String },
  isDefault: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add indexes for frequently queried fields
emailTemplateSchema.index({ name: 1 });
emailTemplateSchema.index({ category: 1 });
emailTemplateSchema.index({ tags: 1 });
emailTemplateSchema.index({ createdAt: -1 });

const EmailTemplateModel = mongoose.model('EmailTemplate', emailTemplateSchema);

module.exports = EmailTemplateModel;
