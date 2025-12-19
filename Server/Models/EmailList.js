const mongoose = require('mongoose');

const EmailListSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    position: { type: String },
    company: { type: String },
    phone: { type: String },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'unsubscribed', 'bounced'],
        default: 'active',
        index: true
    },
    tags: [String],
    emailVerified: { 
        type: Boolean, 
        default: false 
    },
    subscriptionDate: { type: Date },
    unsubscribeDate: { type: Date },
    lastContactDate: { type: Date },
    bounceReason: { type: String },
    dateAdded: { 
        type: Date, 
        default: Date.now,
        index: true
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Add indexes for frequently queried fields
EmailListSchema.index({ email: 1 });
EmailListSchema.index({ status: 1 });
EmailListSchema.index({ tags: 1 });
EmailListSchema.index({ dateAdded: -1 });

const EmailListModel = mongoose.model('EmailList', EmailListSchema);

module.exports = EmailListModel;
