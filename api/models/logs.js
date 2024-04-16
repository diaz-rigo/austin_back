const mongoose = require('mongoose');

// Define el esquema del registro
const loggerSchema = mongoose.Schema({
    date: { type: Date, default: Date.now }, // Usar Date para almacenar la fecha y hora actual automáticamente
    level: { type: String, enum: ['INFO', 'WARNING', 'ERROR'], required: true }, // Agregar nivel de registro para categorizar los registros
    message: { type: String, required: true }, // Mensaje del registro
    meta: { type: mongoose.Schema.Types.Mixed } // Objeto opcional para metadatos adicionales
}, { versionKey: false });

// Crea un índice compuesto para buscar registros por fecha y nivel
loggerSchema.index({ date: -1, level: 1 });

// Crea un modelo basado en el esquema
const Logger = mongoose.model('Log', loggerSchema);

module.exports = Logger;
