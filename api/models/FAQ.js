// models/FAQ.js
const mongoose = require('mongoose');

// Esquema para Preguntas Frecuentes
const faqSchema = new mongoose.Schema({
    question: { type: String, required: true }, // La pregunta
    answer: { type: String, required: true }, // La respuesta
    createdAt: { type: Date, default: Date.now }, // Fecha de creación
    updatedAt: { type: Date, default: Date.now } // Fecha de última actualización
});

// Actualiza automáticamente la fecha de actualización
faqSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});


module.exports  = mongoose.model('FAQ', faqSchema);
