const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  header: { type: String, required: true },
  body: { type: String, required: true },
  footer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);