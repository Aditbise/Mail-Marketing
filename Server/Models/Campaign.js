const mongoose = require('mongoose');

const Campaignschema = new mongoose.Schema({
    Name: { type: String, required: true },
    Subject: { type: String, required: true },
    Image: { type: Buffer, required: true },
    ImageType: { type: String, required: true, enum: ['png', 'jpg', 'jpeg', 'gif']},
    SegmentAddress: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', Campaignschema);