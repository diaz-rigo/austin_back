const mongoose = require('mongoose');
const Product = require('../models/product');
const Review = require('../models/review');
const User = require("../models/user");

exports.addReview = async (req, res, next) => {
    const { productId, userId, email, comment, rating } = req.body;
    console.log(req.body)
    try {
        const usuario = await User.findOne({ email: email });
        if (userId) {
            const nuevaReseña = new Review({
                productId: productId,
                userId: userId,
                comment: comment,
                rating: rating
            });
            await nuevaReseña.save();
            return res.status(201).json({ mensaje: 'Reseña agregada exitosamente.', reseña: nuevaReseña })
        }else if(!userId && usuario){
            const nuevaReseña = new Review({
                productId: productId,
                userId: usuario._id,
                comment: comment,
                rating: rating
            });
            await nuevaReseña.save();
            return res.status(201).json({ mensaje: 'Reseña agregada exitosamente.', reseña: nuevaReseña })
        }
      
        if (!usuario) {
            return res.status(404).json({ mensaje: 'El usuario con el correo proporcionado no esta registrado en nuestra tienda.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Ocurrió un error al agregar la reseña.' });
    }
}


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
