// controllers/feedbackController.js
const Feedback = require('../models/Feedback');

// Crear feedback
exports.createFeedback = async (req, res) => {
  try {
    const { datosCliente, npsScore, easeOfUse, satisfaction } = req.body;

    // Validar datos obligatorios
    if (!datosCliente?.name || !datosCliente?.email || npsScore == null || easeOfUse == null || satisfaction == null) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // Crear el feedback en la base de datos
    const feedback = new Feedback({
      datosCliente,
      npsScore,
      easeOfUse,
      satisfaction
    });
    await feedback.save();

    // Respuesta exitosa
    res.status(201).json({ message: 'Feedback guardado exitosamente', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el feedback', error });
  }
};
