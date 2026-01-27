const mongoose = require('mongoose');

const SegmentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    description: { 
        type: String,
        trim: true
    },
    contacts: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EmailList'
    }],
    filters: {
        condition: String,
        value: String,
        operator: String
    },
    totalContacts: {
        type: Number,
        default: 0
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
SegmentSchema.index({ createdAt: -1 });

const SegmentModel = mongoose.model('Segment', SegmentSchema);

module.exports = SegmentModel;
