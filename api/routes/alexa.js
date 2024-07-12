// auth.js

const express = require('express');
const router = express.Router();
const Alexa_AuthController = require('../controllers/alexa');
const AccountActivationController = require('../controllers/accountActivation');



// Otras rutas existentes...
router.post("/sign-in", Alexa_AuthController.AUTH_USER_);


module.exports = router;