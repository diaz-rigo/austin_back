const mongoose = require("mongoose");
const User = require("../models/user");
const cloudinary = require('../utils/cloudinary'); // Importa la configuración de Cloudinary

exports.editProfile = async (req, res, next) => {
    const userId = req.params.userId;

    // Verifica si el usuario existe
    let user;
    try {
        user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: "An error occurred", error: err });
    }

    // Guarda la foto de perfil en Cloudinary
    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'profile_photos',
                public_id: `${userId}_${Date.now()}`,
            });
            user.profilePhoto = result.secure_url;
        } catch (err) {
            return res.status(500).json({ message: "An error occurred while uploading the image", error: err });
        }
    } else {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // Guarda los cambios del usuario
    try {
        await user.save();
        res.status(200).json({ message: "Profile photo uploaded successfully", user });
    } catch (err) {
        res.status(500).json({ message: "An error occurred", error: err });
    }
};
