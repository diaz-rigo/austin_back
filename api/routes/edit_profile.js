const express = require("express");
const router = express.Router();
const perfil = require("../controllers/editprofile");
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });
router.put('/:userId/update-photo', perfil.updateurlphotouser);

// Ruta para subir la imagen
router.post('/upload-image-profile', upload.single('profilePhoto'), perfil.uploadImageProfile);

module.exports = router;
