// controllers/feedbackController.js
const Feedback = require('../models/Feedback');

// Crear feedback
exports.createFeedback = async (req, res) => {
  try {
    const { datosCliente, npsScore, easeOfUse, satisfaction } = req.body;

    // Validar datos obligatorios
    if (!datosCliente?.name || !datosCliente?.email || npsScore == null || easeOfUse == null || satisfaction == null) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.'+ req.body});
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

// Obtener todos los feedbacks y calcular promedios para graficar
exports.getFeedbackStats = async (req, res) => {
  try {
    // Obtener todos los feedbacks
    const feedbacks = await Feedback.find();

    // Calcular promedios
    const totalFeedbacks = feedbacks.length;
    const averageScores = {
      npsScore: feedbacks.reduce((sum, feedback) => sum + feedback.npsScore, 0) / totalFeedbacks,
      easeOfUse: feedbacks.reduce((sum, feedback) => sum + feedback.easeOfUse, 0) / totalFeedbacks,
      satisfaction: feedbacks.reduce((sum, feedback) => sum + feedback.satisfaction, 0) / totalFeedbacks
    };

    res.status(200).json({
      totalFeedbacks,
      averageScores,
      feedbacks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo feedbacks', error });
  }
};