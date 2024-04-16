const mongoose = require('mongoose');
const loggerSchema = mongoose.Schema({
    date: { type: Date, default: Date.now }, 
    level: { type: String, enum: ['INFO', 'WARNING', 'ERROR'], required: true },
    message: { type: String, required: true }, 
    userAgent: { 
        browser: String,
        version: String,
        os: String,
        platform: String,
        source: String
    },
    meta: { type: mongoose.Schema.Types.Mixed }
}, { versionKey: false });
loggerSchema.index({ date: -1, level: 1 });
const Logger = mongoose.model('Log', loggerSchema);

module.exports = Logger;
