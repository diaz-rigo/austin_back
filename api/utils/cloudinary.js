const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'dfd0b4jhf', 
  api_key: '127447557338245', 
  api_secret: 'rfwUHsBxdishIqnTRbY6BU2r7U0' 
});

module.exports = cloudinary;
