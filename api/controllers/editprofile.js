const mongoose = require("mongoose");
const User = require("../models/user");
const fs = require('fs');
const cloudinary = require('../utils/cloudinary'); // Importa la configuración de Cloudinary


exports.updateurlphotouser = async (req, res, next) => {
  const { userId } = req.params; // Suponiendo que recibes el ID del usuario como parámetro en la URL
  const { imageUrl } = req.body; // Suponiendo que recibes la URL de la nueva imagen como parte del cuerpo de la solicitud

  try {
      // Primero, verifica si el usuario existe en la base de datos
      const user = await User.findById(userId);

      if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Guarda la URL de la imagen en la propiedad profilePhoto del usuario
      user.profilePhoto = imageUrl;
      
      // Guarda los cambios en la base de datos
      await user.save();

      return res.status(200).json({ message: "URL de foto de perfil actualizada exitosamente", user });
  } catch (error) {
      console.error("Error al actualizar la URL de la foto de perfil:", error);
      return res.status(500).json({ message: "Error interno del servidor" });
  }
}


exports.uploadImageProfile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado ninguna imagen.' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'perfiles' });

    // Eliminar el archivo temporal después de subirlo a Cloudinary
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json({ image: result.secure_url });
  } catch (error) {
    console.error("Error al subir imagen a Cloudinary:", error);
    res.status(500).json({ message: 'Ocurrió un error al subir la imagen.', error });
  }
};




