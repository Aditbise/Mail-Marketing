const mongoose = require('mongoose');

const SegmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'emaillist' }],
    filters: Object,
    dateCreated: { type: Date, default: Date.now }
});

const SegmentModel = mongoose.model('segment', SegmentSchema);

module.exports = SegmentModel;
