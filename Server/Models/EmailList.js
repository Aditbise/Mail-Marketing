const mongoose = require('mongoose');

const EmailListSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
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
        default: 'active'
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
        default: Date.now
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// Add indexes for frequently queried fields
EmailListSchema.index({ status: 1 });
EmailListSchema.index({ tags: 1 });
EmailListSchema.index({ dateAdded: -1 });

const EmailListModel = mongoose.model('EmailList', EmailListSchema);

module.exports = EmailListModel;
