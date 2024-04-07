// Pedido.js
const mongoose = require('mongoose');

const pedidoSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    codigoPedido: { type: String, required: true, unique: true }, // Identificador único del pedido
    usuario: { type: mongoose.Schema.Types.ObjectId, ref:'Usuario', required: true }, // Referencia al ID del usuario que realizó el pedido
    detallePedido: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PedidoDetalle' }], // Referencia a los detalles del pedido
    estadoPedido: { type: String, required: true }, // Estado actual del pedido
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Pedido', pedidoSchema);
