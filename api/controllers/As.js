
exports.uploadTexturecloudinary = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se han enviado texturas.' });
    }

    const uploadedTextures = [];
    const uploadPromises = req.files.map(async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'texturas' });
        uploadedTextures.push(result.secure_url);
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (error) {
        console.error(`Error al subir ${file.originalname}:`, error);
      }
    });

    await Promise.all(uploadPromises);
    res.status(201).json({ textures: uploadedTextures });
  } catch (error) {
    console.error("Error al subir texturas a Cloudinary:", error);
    res.status(500).json({ message: 'Ocurrió un error al subir las texturas.', error });
  }
};