const mongoose = require('mongoose');
const Product = require('../models/product');
const Review = require('../models/review');

exports.addReview = async (req, res, next) => {
    const { productId, userId, comment, rating } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid product or user ID' });
    }

    try {
        const review = new Review({
            productId: new mongoose.Types.ObjectId(productId),
            userId: new mongoose.Types.ObjectId(userId),
            comment,
            rating
        });

        await review.save();

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (error) {
        next(error);
    }
};

exports.getProductReviews = async (req, res, next) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID' });
    }

    try {
        const reviews = await Review.find({ productId: new mongoose.Types.ObjectId(productId) })
                                    .populate('userId', 'username'); // Assuming User model has 'username' field

        res.status(200).json(reviews);
    } catch (error) {
        next(error);
    }
};
