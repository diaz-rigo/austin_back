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




router.get("/category/:id", ProductController.getByCategory);
router.post("/page/:limit/:skip", ProductController.getAllPaginate);
router.put("/:productId/status", ProductController.updateProductStatus);
router.delete('/:id/:imageName', ProductController.deleteImage);

module.exports = router;
