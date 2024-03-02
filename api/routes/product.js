const express = require("express");
const router = express.Router();
const upload = require('../middlewares/upload');
const ProductController = require('../controllers/product');

router.get("/", ProductController.getAll);
router.post("/", ProductController.create);
router.get("/:id", ProductController.get);
router.put("/:id", ProductController.update);
router.delete("/:id", ProductController.delete);

router.put("/:category/:id/image", upload.single('image'), ProductController.updateImage);
// router.put("/:category/:id/image", upload.array('images'), ProductController.updateImages); // `upload.array('images', 5)` significa que se pueden subir hasta 5 imágenes



router.get("/category/:id", ProductController.getByCategory);
router.post("/page/:limit/:skip", ProductController.getAllPaginate);
router.put("/:productId/status", ProductController.updateProductStatus);
router.delete('/:id/:imageName', ProductController.deleteImage);

module.exports = router;
