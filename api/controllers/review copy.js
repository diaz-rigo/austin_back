const mongoose = require('mongoose');
const Product = require('./product');
const Review = require('./review');

mongoose.connect('mongodb://localhost:27017/tuBaseDeDatos', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function addReview(productId, userId, comment, rating) {
    try {
        const review = new Review({ productId, userId, comment, rating });
        await review.save();
        console.log('Reseña añadida correctamente');
    } catch (error) {
        console.error('Error añadiendo la reseña:', error);
    }
}

// Ejemplo de uso
addReview('productId1', 'userId1', '¡Excelente producto!', 5);
async function getProductReviews(productId) {
    try {
        const reviews = await Review.find({ productId }).populate('userId', 'username'); // Suponiendo que tienes un campo 'username' en el modelo de usuario
        console.log('Reseñas del producto:', reviews);
    } catch (error) {
        console.error('Error obteniendo las reseñas:', error);
    }
}

// Ejemplo de uso
getProductReviews('productId1');
