// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  datosCliente: {
    name: { type: String, required: true },             // Nombre del cliente
    email: { type: String, required: true },            // Email del cliente
  },
  npsScore: { type: Number, required: true },           // Puntuación NPS del usuario
  easeOfUse: { type: Number, required: true },          // Facilidad de uso
  satisfaction: { type: Number, required: true }        // Satisfacción del usuario
}, {
  timestamps: true                                       // Fechas de creación y actualización
});

module.exports = mongoose.model('Feedback', feedbackSchema);
