// PedidoDetalle.js
const mongoose = require('mongoose');

const pedidoDetalleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    cantidad: { type: Number, required: true },
    dia: { type: Date, required: true },
    hora: { type: String },
    modo: { type: String},
    modoPersonalizado: { type: String },
    sabor: { type: String },
    saborPersonalizado: { type: String },
    tipoProducto: { type: String },
    tamañoPorción: { type: String },
    decoracion: { type: String },
    mensajePersonalizado: { type: String },
    entregaEspecial: { type: String },
    preferenciasDieteticas: { type: String },
    precioTotal: { type: Number },
    estadoPedido: { type: String },
    notasAdicionales: { type: String }
}, { versionKey: false });

module.exports = mongoose.model('PedidoDetalle', pedidoDetalleSchema);
