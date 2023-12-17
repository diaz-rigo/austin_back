const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    console.log(req);
    const path = `./uploads/${req.params.category}/${req.params.id}`;
  fs.mkdirSync(path, { recursive: true })
  fs.mkdir(path, err => cb(null, path));
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





// Function to delete a directory and its contents recursively
// const deleteDirectory = async (path) => {
//   const unlink = util.promisify(fs.unlink);
//   const rmdir = util.promisify(fs.rmdir);
//   const readdir = util.promisify(fs.readdir);

//   try {
//     const files = await readdir(path);
//     await Promise.all(files.map(async (file) => {
//       const filePath = `${path}/${file}`;
//       const stat = await fs.promises.stat(filePath);
//       if (stat.isDirectory()) {
//         await deleteDirectory(filePath);
//       } else {
//         await unlink(filePath);
//       }
//     }));
//     await rmdir(path);
//     console.log(`Directory deleted: ${path}`);
//   } catch (error) {
//     console.error(`Error deleting directory ${path}: ${error.message}`);
//   }
// };

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
