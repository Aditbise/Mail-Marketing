const mongoose = require('mongoose');

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