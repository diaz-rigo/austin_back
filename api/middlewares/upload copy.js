// const multer = require('multer');

// // Elimina la configuración de almacenamiento en disco
// const storage = multer.memoryStorage();

// const imageFileFilter = (req, file, cb) => {
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/jpg') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const pdfFileFilter = (req, file, cb) => {
//   if (file.mimetype === 'application/pdf') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const maxFileSize = 1024 * 1024 * 5; // 5MB

// exports.image = multer({
//   storage: storage,
//   limits: {
//     fileSize: maxFileSize
//   },
//   fileFilter: imageFileFilter
// });

// exports.pdf = multer({
//   storage: storage,
//   limits: {
//     fileSize: maxFileSize
//   },
//   fileFilter: pdfFileFilter
// });
