const mongoose = require('mongoose');

const loggerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: { type: String, required: true },
    description: { type: String, required: true },
    apiToken: { type: String, required: true, unique: true }, // Agregamos el campo del token
}, { versionKey: false });

module.exports = mongoose.model('Logger', loggerSchema);
