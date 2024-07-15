const express = require('express');
const router = express.Router();

const pushSubscriptionController = require('../controllers/pushSubscription');

router.get('/', pushSubscriptionController.getAllSubscriptions);
router.post('/', pushSubscriptionController.createSubscription);
router.post('/logeo', pushSubscriptionController.createSubscription2);
router.get('/:id', pushSubscriptionController.getSubscription);
router.delete('/:id', pushSubscriptionController.deleteSubscription);


router.post('/enviar', pushSubscriptionController.enviarNotificacion);

module.exports = router;
