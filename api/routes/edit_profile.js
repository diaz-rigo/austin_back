const express = require("express");
const router = express.Router();
const userController = require("../controllers/editprofile");
const multer = require('multer');

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Ruta para editar perfil y subir foto de perfil
router.post('/edit/:userId', upload.single('profilePhoto'), userController.editProfile);

module.exports = router;
