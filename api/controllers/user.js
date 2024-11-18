const mongoose = require("mongoose");
const User = require("../models/user");


exports.update = (req, res, next) => {
  const _id = req.params.id;
  const body = {
    email: req.body.email,
    name: req.body.name,
    paternalLastname: req.body.paternalLastname,
    maternalLastname: req.body.maternalLastname,
    rol: req.body.rol,
    phone: req.body.phone,
    address: req.body.address,
    city: req.body.city,
    postalCode: req.body.postalCode,
    country: req.body.country,
    dateOfBirth: req.body.dateOfBirth,
  };
  
  User.findOneAndUpdate({ _id: _id }, { $set: body }, { new: true })
    .exec()
    .then((doc) => {
      res.status(200).json(doc);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
};
exports.getAll = (req, res, next) => {
  // console.log(req)
    User.find()
        .exec()
        .then(docs => {
            res.status(200).json(docs)
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.create = (req, res, next) => {
      const user = new User({
        // _id: mongoose.Types.ObjectId(),
        _id: new mongoose.Types.ObjectId(), // Utiliza 'new'
        email: req.body.email,
        password: req.body.password,
        rol: req.body.rol,
        name: req.body.name,
        lastname: req.body.lastname,
        document: req.body.document,
        status: 'ACTIVE'
      });
      user.save()
        .then(result => {
            res.status(201).json(result);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.get = (req, res, next) => {
  User.findById(req.params.id)
    .exec()
    .then(doc => {
      if (!doc) {
        return res.status(404).json({ message: "Not found" });
      }
      res.status(200).json(doc);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};


exports.delete = (req, res, next) => {
    const _id = req.params.id;
    User.deleteOne({ _id: _id })
        .exec()
        .then(result => {
            res.status(200).json({
                _id: _id,
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.getUserByEmail = async (req, res) => {
  const email = req.params.email;

  try {
      // Buscar al usuario por correo electrónico
      const user = await User.findOne({ email: email });

      // Si no se encuentra el usuario, retornar un error 404
      if (!user) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Retornar los datos del usuario
      res.status(200).json(user);
  } catch (error) {
      // Manejo de errores
      res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};