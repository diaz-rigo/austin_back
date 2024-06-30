// auth.js

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth');
const AccountActivationController = require('../controllers/accountActivation');

// Importa el middleware para guardar los logs de las solicitudes
const { saveRequestLogs } = require('../controllers/logs');

// Aplica el middleware a todas las solicitudes
router.use(saveRequestLogs);


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
router.post("/consulta_us_tel_correo", AuthController.consulta_us_tel_correo);
router.post("/verificca_respuest", AuthController.verfifica_respueta);
router.post("/cambiarContrasena_", AuthController.cambiarContrasena);


// Nueva ruta para activar la cuenta
router.post("/activate", AccountActivationController.activarCuenta);
router.post('/send-activation-email', AccountActivationController.sendActivationEmail);

module.exports = router;