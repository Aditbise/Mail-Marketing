const mongoose = require('mongoose');

const CompanyInfoSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  socialLinks: {
    facebook: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    instagram: { type: String },
    youtube: { type: String }
  },
  logo: { type: String },
  description: { type: String },
  industry: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ADD THE INDEXES HERE - AFTER SCHEMA DEFINITION, BEFORE EXPORT
CompanyInfoSchema.index({ companyName: 1 });
CompanyInfoSchema.index({ email: 1 });

// You can also add compound indexes for better performance
CompanyInfoSchema.index({ companyName: 1, email: 1 });
CompanyInfoSchema.index({ createdAt: -1 }); // For sorting by date (newest first)

module.exports = mongoose.model('CompanyInfo', CompanyInfoSchema);