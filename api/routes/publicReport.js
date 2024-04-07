const express = require("express");
const router = express.Router();

const PublicReport = require('../controllers/publicReport');

router.get("/", PublicReport.consultaventas_or_pedidos_by_code);

module.exports = router;
