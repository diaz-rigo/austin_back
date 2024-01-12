const multer = require('multer');
const fs = require('fs');

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     console.log(req);
//     const path = `./uploads/${req.params.category}/${req.params.id}`;
//   fs.mkdirSync(path, { recursive: true })
//   fs.mkdir(path, err => cb(null, path));
//   },
//   filename: function(req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const basePath = './uploads';
    const categoryPath = `${basePath}/${req.params.category}`;
    const idPath = `${categoryPath}/${req.params.id}`;

    try {
      fs.mkdirSync(basePath, { recursive: true });
      fs.mkdirSync(categoryPath, { recursive: true });
      fs.mkdirSync(idPath, { recursive: true });

      cb(null, idPath);
    } catch (error) {
      console.error(`Error creating directories: ${error.message}`);
      cb(error, null);
    }
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});


const imageFileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};





const maxFileSize = 1024 * 1024 * 5; // 5MB

exports.image = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: imageFileFilter
});

exports.pdf = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSize
  },
  fileFilter: pdfFileFilter
});
