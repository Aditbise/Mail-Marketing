const mongoose = require('mongoose');

const emailBodySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    content: { 
        type: String, 
        required: true
    },
    subject: {
        type: String,
        trim: true
    },
    contentType: {
        type: String,
        enum: ['text', 'html', 'mixed'],
        default: 'html'
    },
    attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        path: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    tags: [String],
    isArchived: {
        type: Boolean,
        default: false
    },
    createdAt: { 
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
emailBodySchema.index({ name: 1 });
emailBodySchema.index({ tags: 1 });
emailBodySchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmailBody', emailBodySchema);