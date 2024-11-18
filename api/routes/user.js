const express = require("express");
const router = express.Router();

const UserController = require('../controllers/user');

router.get("/", UserController.getAll);

router.post("/", UserController.create);

router.get("/:id", UserController.get);
router.get('/email/:email', UserController.getUserByEmail);

router.put("/:id", UserController.update);


router.delete("/:id", UserController.delete);


module.exports = router;
