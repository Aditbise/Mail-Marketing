const mongoose = require('mongoose');

const emailBodySchema = new mongoose.Schema({
    Name: { 
        type: String, 
        required: true 
    },
    bodyContent: { 
        type: String, 
        default: '' 
    },
    contentType: {
        type: String,
        enum: ['text', 'file', 'mixed'],
        default: 'text'
    },
    attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        path: String,
        uploadDate: { type: Date, default: Date.now }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('EmailBody', emailBodySchema);