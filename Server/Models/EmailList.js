const mongoose = require('mongoose');

const EmailListSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    position: { type: String },
    company: { type: String },
    dateAdded: { type: Date, default: Date.now }
});

const EmailListModel = mongoose.model('emaillist', EmailListSchema);

module.exports = EmailListModel;
