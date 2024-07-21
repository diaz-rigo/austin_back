
const mongoose = require('mongoose');

const ventaDetailSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    deliveryType: { type: String, },
    deliveryDate: { type: Date },
    instrucion: { type: String },
    status: { type: String, required: true, default: 'PENDING' },
    createdAt: { type: Date, default: Date.now },
    
}, { versionKey: false });

module.exports = mongoose.model('VentaDetail', ventaDetailSchema);