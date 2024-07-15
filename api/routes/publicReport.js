const express = require("express");
const router = express.Router();

const PublicReport = require('../controllers/publicReport');

router.get("/", PublicReport.consultaventas_or_pedidos_by_code);



// Ruta para listar las compras de un usuario específico
router.get("/compras/:userId", PublicReport.list_compras_iduser);

// Ruta para listar los pedidos de un usuario específico
router.get("/pedidos/:userId", PublicReport.list_pedidos_iduser);

module.exports = router;
