const mongoose = require('mongoose');
const User = require('../models/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.activarCuenta = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    // Verificar el token de activación
    const decoded = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);

    // Actualizar el usuario en la base de datos para activar la cuenta
    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Actualizar la contraseña (puedes implementar tu lógica de seguridad aquí)
    user.password = password;
    user.status = 'ACTIVE'; // Otra opción podría ser establecer un estado 'ACTIVE'

    await user.save();

    res.json({ message: 'Cuenta activada correctamente.' });
  } catch (error) {
    console.error('Error al activar la cuenta:', error);
    res.status(400).json({ error: 'Error al activar la cuenta. El enlace puede haber expirado.' });
  }
};
