const express = require('express');
const router = express.Router();
const Review = require('../controllers/review');

// Ruta para añadir una reseña
router.post('/add-review', Review.addReview);

// Ruta para obtener reseñas de un producto
router.get('/:productId/reviews', Review.getProductReviews);

module.exports = router;
