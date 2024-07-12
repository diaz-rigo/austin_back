require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const webpush = require('web-push');

"use strict";
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSMAIL,
  },
});

// Configurar las claves VAPID
const vapidKeys = {
  publicKey: "BFYtOg9-LQWHmObZKXm4VIV2BImn5nBrhz4h37GQpbdj0hSBcghJG7h-wldz-fx9aTt7oaqKSS3KXhA4nXf32pY",
  privateKey: "daiRV8XPPoeSHC4nZ5Hj6yHr98saYGlysFAuEJPypa0"
};



webpush.setVapidDetails(
  'mailto:austins0271142@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Controlador de autenticación
exports.AUTH_USER_ = async (req, res) => {
    const { name, phone } = req.body;
    
    try {
        // Buscar usuario por nombre y teléfono
        const user = await User.findOne({ name, phone });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Si el usuario es encontrado, retorna los datos del usuario
        return res.status(200).json({
            message: 'Authentication successful',
            user: {
                _id: user._id,
                email: user.email,
                rol: user.rol,
                name: user.name,
                maternalLastname: user.maternalLastname,
                paternalLastname: user.paternalLastname,
                phone: user.phone,
                status: user.status,
                address: user.address,
                city: user.city,
                postalCode: user.postalCode,
                country: user.country,
                securityQuestion: user.securityQuestion,
                securityAnswer: user.securityAnswer,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};