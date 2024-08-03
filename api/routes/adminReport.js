const express = require("express");
const router = express.Router();
// const upload = require('../middlewares/upload');
const AdminReport = require('../controllers/adminReport');

router.get("/pedidos", AdminReport.consultapedidos);
router.get("/ventas", AdminReport.consultaventas);
router.get('/estadisticas', AdminReport.estadisticas);
router.get('/estadisticas_pedidos', AdminReport.estadisticas_pedidos);
router.get('/estadisticas_user', AdminReport.estadisticas_user);

module.exports = router;
