// controllers/faqController.js
const FAQ = require('../models/FAQ');

// Obtener todas las preguntas frecuentes
exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 }); // Ordenar por fecha de creación
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching FAQs', error });
    }
};

// Crear una nueva pregunta frecuente
exports.createFAQ = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const newFAQ = new FAQ({ question, answer });
        await newFAQ.save();
        res.status(201).json(newFAQ);
    } catch (error) {
        res.status(500).json({ message: 'Error creating FAQ', error });
    }
};

// Actualizar una pregunta frecuente
exports.updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const updatedFAQ = await FAQ.findByIdAndUpdate(
            id,
            { question, answer, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedFAQ) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        res.json(updatedFAQ);
    } catch (error) {
        res.status(500).json({ message: 'Error updating FAQ', error });
    }
};

// Eliminar una pregunta frecuente
exports.deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFAQ = await FAQ.findByIdAndDelete(id);

        if (!deletedFAQ) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting FAQ', error });
    }
};
