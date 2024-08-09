const Contact = require('../models/Contact');

// Crear un nuevo contacto
exports.createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ success: true, message: 'Mensaje recibido. Pendiente de aprobación.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar el mensaje.' });
  }
};

// Obtener todos los mensajes aprobados
exports.getApprovedContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ approved: true });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener los mensajes aprobados.' });
  }
};

// Aprobar un mensaje
exports.approveContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    res.status(200).json({ success: true, message: 'Mensaje aprobado.', contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al aprobar el mensaje.' });
  }
};
// Obtener todos los mensajes pendientes (sin aprobar)
exports.getPendingContacts = async (req, res) => {
    try {
      const contacts = await Contact.find({ approved: false });
      res.status(200).json(contacts);
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener los mensajes pendientes.' });
    }
  };
  
