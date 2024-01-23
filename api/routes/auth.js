// auth.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');

// Otras rutas existentes...
router.post("/sign-up-and-verify-email", AuthController.signUpAndVerifyEmail);
router.post("/sign-in", AuthController.signIn);
router.get("/verify/:token", AuthController.verifyEmail);

module.exports = router;
