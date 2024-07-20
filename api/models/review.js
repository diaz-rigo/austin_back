const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
