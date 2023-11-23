const mongoose = require("mongoose");
const Product = require("../models/product");
const path = require('path');
const fs = require('fs');
// const fileType = require('file-type');
// import {fileType } from 'file-type';
import('file-type').then(ft => {
  const fileType = ft.default || ft; // Manejar la exportación por defecto en ESM
  // Resto del código que utiliza fileType...
});


exports.getAll = (req, res, next) => {
  Product.find()
    .exec()
    .then(docs => {
      console.log('docs')
      res.status(200).json(docs)
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};


exports.get = (req, res, next) => {
  Product.findById(req.params.id)
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


exports.create = (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    sku: req.body.sku,
    name: req.body.name,
    description: req.body.description,
    unit: req.body.unit,
    expiration: req.body.expiration,
    model: req.body.model,
    quantity: req.body.quantity,
    price: req.body.price,
    category: req.body.category,
    maker: req.body.maker,
    images: req.body.images || [],
    status: 'ACTIVE',
    weight: req.body.weight || null,
    ingredients: req.body.ingredients || [],
    allergens: req.body.allergens || [],
    nutritionalInformation: req.body.nutritionalInformation || null,
    isFeatured: req.body.isFeatured || false,
    isVegetarian: req.body.isVegetarian || false,
    isGlutenFree: req.body.isGlutenFree || false,
    createdAt: new Date() // La fecha y hora de creación se asigna automáticamente al momento de crear el producto
  });

  product.save()
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};





exports.update = (req, res, next) => {
  const _id = req.params.id;
  const body = {
    sku: req.body.sku,
    name: req.body.name,
    description: req.body.description,
    unit: req.body.unit,
    expiration: req.body.expiration,
    model: req.body.model,
    quantity: req.body.quantity,
    price: req.body.price,
    category: req.body.category,
    maker: req.body.maker,
    images: req.body.images, // Puedes añadir esta línea si también permites editar imágenes
    status: req.body.status, // Asumiendo que hay un campo para el estado del producto (ACTIVE o INACTIVE)
    weight: req.body.weight,
    ingredients: req.body.ingredients,
    allergens: req.body.allergens,
    nutritionalInformation: req.body.nutritionalInformation,
    isFeatured: req.body.isFeatured,
    isVegetarian: req.body.isVegetarian,
    isGlutenFree: req.body.isGlutenFree,
    // Agrega otros campos del formulario según sea necesario
  };

  Product.findOneAndUpdate({ _id: _id }, { $set: body }, { new: true })
    .exec()
    .then(doc => {
      if (!doc) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.status(200).json(doc);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};

exports.delete = (req, res, next) => {
  const _id = req.params.id;
  Product.deleteOne({ _id: _id })
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


exports.getByCategory = (req, res, next) => {
  Product.find({ category: req.params.id })
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

exports.getAllPaginate = (req, res, next) => {
  const skip = parseInt(req.body.skip) || 0;
  const limit = parseInt(req.body.limit) || 10;
  const query = {};

  const filters = req.body.filters;
  if (filters) {
    if (filters.name) {
      query.name = new RegExp(filters.name, 'i');
    }
    if (filters.sku) {
      query.sku = new RegExp(filters.sku, 'i');
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.priceMin && filters.priceMax) {
      query.price = { $gte: parseFloat(filters.priceMin), $lte: parseFloat(filters.priceMax) };
    }
    if (filters.maker) {
      query.maker = filters.maker;
    }
  }
  // Ordenar por fecha de creación en orden descendente (DESC)
  const sort = { createdAt: -1 };

  Product.find(query)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec()
    .then(docs => {
      // Mapear los documentos para incluir el campo createdAt en la respuesta
      const response = docs.map(doc => {
        return {
          ...doc._doc,
          createdAt: doc.createdAt // Agregar el campo createdAt a cada documento
        };
      });
      res.status(200).json(response);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
};





exports.updateImage = (req, res, next) => {
  const _id = req.params.id;
  const category = req.params.category;
  let images = [];
  Product.findById(_id, (error, response) => {
    console.log('product find', response)
    images = response.images;
    if (error) return res.status(404).json({ message: "Error to find product!!" });
    console.log('find', images)
    console.log(`req.position: ${req.body.position}, req.file: ${req.file.filename}`)
    if (req.body.position === 0 || req.body.position && req.file) {
      const body = {
        position: req.body.position,
        image: `uploads/${category}/${_id}/${req.file.filename}`//'/uploads/' + req.file.filename
      };
      if (images.length > body.position) {
        console.log('if', images);
        images[body.position] = body.image;
      } else {
        console.log('else', images);
        images.push(body.image);
      }
    } else {
      return res.status(404).json({ message: "Error to request!!" });
    }
    console.log('set', images)
  Product.findOneAndUpdate({ _id: _id }, { $set: {images: images} }, {new: true})
    .exec()
    .then(doc => {
      console.log('update', images)
      res.status(200).json({
          image: doc
      });
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
  });

  
};


// Importa el modelo de Producto si es necesario
// const Product = require('../models/Product');

exports.updateProductStatus = (req, res, next) => {
  const productId = req.params.productId;
  const newStatus = req.body.status; // Se espera que el nuevo estado esté en el cuerpo de la solicitud

  // Realizar la lógica para actualizar el estado del producto con el ID productId y el nuevo estado newStatus
  // Por ejemplo, si estás utilizando Mongoose para interactuar con MongoDB:
  Product.findByIdAndUpdate(productId, { status: newStatus })
    .then(updatedProduct => {
      res.status(200).json(updatedProduct); // Devuelve el producto actualizado
    })
    .catch(error => {
      res.status(500).json({ error: "Error al actualizar el estado del producto" });
    });

  // En caso de éxito, enviar una respuesta 200 OK
  res.status(200).json({ message: "Estado del producto actualizado exitosamente" });

  // En caso de error, enviar una respuesta de error, por ejemplo:
  res.status(500).json({ error: "Error al actualizar el estado del producto" });
};
