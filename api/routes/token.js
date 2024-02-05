const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/token");

// Obtener todos los tokens
router.get("/", tokenController.getAll);

// Crear un nuevo token
router.post("/", tokenController.create);

// Obtener un token específico
router.get("/:id", tokenController.get);

// Eliminar un token
router.delete("/:id", tokenController.delete);

module.exports = router;
