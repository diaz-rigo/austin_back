const mongoose = require("mongoose");
const Product = require("../models/product");
const path = require('path');
const fs = require('fs');
// const fs = require('fs');
const objectId = new mongoose.Types.ObjectId();


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




// exports.updateImage = async (req, res, next) => {
//   const productId = req.params.id;

//   try {
//     // Verificar si req.file existe y es una imagen
//     if (!req.file || !req.file.mimetype.startsWith('image/')) {
//       return res.status(400).json({ message: 'Invalid image file!' });
//     }

//     // Obtener el producto por su ID
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: 'Product not found!' });
//     }

//     let images = product.images || [];

//     const newPosition = req.body.position || 0;

//     // Verificar si la posición es válida
//     if (newPosition < 0 || newPosition > images.length) {
//       return res.status(400).json({ message: 'Invalid position!' });
//     }

//     const newImage = `uploads/${productId}/${req.file.filename}`;

//     // Actualizar la posición de la imagen
//     images.splice(newPosition, 0, newImage);

//     // Actualizar el producto con las nuevas imágenes
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       { images: images },
//       { new: true }
//     );

//     res.status(200).json({ image: updatedProduct.images[newPosition] });
//   } catch (error) {
//     console.error('Error updating image:', error);
//     res.status(500).json({ error: 'Internal Server Error DJ' });
//   }
// };


exports.updateImage = async (req, res, next) => {
  const _id = req.params.id;

  try {
    const response = await Product.findById(_id).exec();

    if (!response) {
      return res.status(404).json({ message: 'Error: Product not found!' });
    }

    // Verifica si el archivo se subió correctamente
    if (!req.file) {
      return res.status(400).json({ message: 'Error: No file uploaded!' });
    }

    const imagePath = `uploads/${_id}/${req.file.filename}`;

    // Agrega la nueva ruta de imagen al array de imágenes
    response.images.push(imagePath);

    // Actualiza la imagen en la base de datos
    const updatedProduct = await response.save();

    res.status(200).json({
      image: updatedProduct
    });
  } catch (err) {
    console.error('Error updating images:', err);
    res.status(500).json({ error: err.message });
  }
};





exports.updateProductStatus = (req, res, next) => {
  const productId = req.params.productId;
  const newStatus = req.body.status; // Se espera que el nuevo estado esté en el cuerpo de la solicitud

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


exports.uploadImage = async (req, res, next) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Error: Product not found!' });
    }

    // Verifica si el archivo se subió correctamente
    if (!req.file) {
      return res.status(400).json({ message: 'Error: No file uploaded!' });
    }

    const imagePath = `uploads/${productId}/${req.file.filename}`;

    // Agrega la nueva ruta de imagen al array de imágenes
    product.images.push(imagePath);

    // Actualiza el producto en la base de datos
    const updatedProduct = await product.save();

    res.status(200).json({
      image: updatedProduct.images[updatedProduct.images.length - 1] // Devuelve la última imagen agregada
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: err.message });
  }
};