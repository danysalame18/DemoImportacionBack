const express = require ('express');
const router = express.Router();

const { SolicitudInsumosPedidosController } = require('../controllers')
const { SolicitudInsumosPedidosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/solicitudInsumosPedidos', verifyToken, SolicitudInsumosPedidosController.findAll);
router.get('/solicitudInsumosPedidos/:id', verifyToken, SolicitudInsumosPedidosController.findOne);
router.post('/solicitudInsumosPedidos', verifyToken, SolicitudInsumosPedidosValidator.create, SolicitudInsumosPedidosController.create);
router.patch('/solicitudInsumosPedidos/:id', verifyToken, SolicitudInsumosPedidosValidator.edit, SolicitudInsumosPedidosController.edit);
router.delete('/solicitudInsumosPedidos/:id', verifyToken,  SolicitudInsumosPedidosController.delete)

module.exports = router;