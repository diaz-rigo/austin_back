// auth.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');

// Otras rutas existentes...
router.post("/sign-up-and-verify-email", AuthController.signUpAndVerifyEmail);
router.post("/sign-in", AuthController.signIn);
router.get("/verify/:token", AuthController.verifyEmail);

// Nuevas rutas para la recuperación de contraseña
// router.post("/request-password-recovery", AuthController.sendRecoveryEmail);
// router.get("/verify-recovery-token/:token", AuthController.verifyRecoveryToken);
// router.post("/reset-password/:token", AuthController.resetPassword);
// Nuevas rutas para la recuperación de contraseña
router.post("/request-password-recovery", AuthController.requestPasswordRecovery);
router.post("/verify-code-and-reset-password", AuthController.verifyCodeAndResetPassword);
router.post("/verify-verification-code", AuthController.verificationcode    );
// \auth\verify-code-and-reset-password
module.exports = router;
