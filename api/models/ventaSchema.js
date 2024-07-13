
const mongoose = require('mongoose');

const ventaSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    details: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VentaDetail', required: true }],
    totalAmount: { type: Number, required: true },
    paypalOrderID: { type: String }, // Campo para almacenar el ID de pedido de PayPal
    stripeSessionID: { type: String }, // Campo para almacenar el ID de pedido de PayPal
    
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

module.exports = mongoose.model('Venta', ventaSchema);
