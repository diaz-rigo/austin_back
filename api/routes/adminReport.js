const express = require("express");
const router = express.Router();
// const upload = require('../middlewares/upload');
const AdminReport = require('../controllers/adminReport');

router.get("/pedidos", AdminReport.consultapedidos);
router.get("/ventas", AdminReport.consultaventas);

module.exports = router;
