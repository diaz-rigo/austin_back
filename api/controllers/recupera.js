const express = require('express');
const router = express.Router();
const User = require('../modelos/usuario');
const transporter = require('../servidor/nodemailerConfig');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');

require('dotenv').config();

// Generar código de verificación de 6 cifras
const generateVerificationCode = () => {
    return nanoid(6);
};

// Ruta para solicitar restablecimiento de contraseña
router.post('/forgot-password', async (req, res) => {
    const { correo } = req.body;

    try {
        if (!correo) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'El campo no debe de estar vacio' });
        }
        // Verificar si el correo electrónico existe en la base de datos
        const user = await User.findOne({ correo });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado', message: 'Correo no encontrado. Verifica el correo proporcionado.' });
        }

        // Generar y guardar código de verificación en el usuario
        const verificationCode = generateVerificationCode();
        user.verificationCode = verificationCode;
        await user.save();

        // Enviar correo electrónico con el código de verificación
        const emailVerificationCode = {
            from: 'Tu Aplicación',
            to: correo,
            subject: 'Código de Verificación',
            text:`Tu código de verificación es: ${verificationCode}}`,
        };

        await transporter.sendMail(emailVerificationCode);

        res.status(200).json({ message: 'Correo electrónico enviado con el código de verificación' });
    } catch (error) {
        console.error('Error al solicitar restablecimiento de contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para verificar el código de verificación
router.post('/verify-code', async (req, res) => {
    const { correo, verificationCode } = req.body;

    try {
        if (!verificationCode) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'El campo no debe de estar vacio' });
        }
        // Obtener el usuario y verificar el código de verificación
        const user = await User.findOne({ correo, verificationCode });

        if (!user) {
            return res.status(400).json({ error: 'Código inválido', message: 'El código proporcionado no es válido.' });
        }

        res.status(200).json({ message: 'Código de verificación válido' });
    } catch (error) {
        console.error('Error al verificar el código de verificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para restablecer la contraseña
router.post('/reset-password', async (req, res) => {
    const { correo, newPassword } = req.body;

    try {
        if (!newPassword) {
            return res.status(400).json({ error: 'Datos incompletos', message: 'El campo no debe de estar vacio' });
        }
        // Obtener el usuario
        const user = await User.findOne({ correo });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado', message: 'No se encontró un usuario con el correo proporcionado' });
        }

        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña y eliminar el código de verificación
        user.contraseña = hashedPassword;
        user.verificationCode = undefined;
        await user.save();

        res.status(200).json({ message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;