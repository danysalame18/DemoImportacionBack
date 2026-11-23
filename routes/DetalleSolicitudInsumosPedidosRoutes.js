const express = require ('express');
const router = express.Router();

const { DetalleSolicitudInsumosPedidosController } = require('../controllers')
const { DetalleSolicitudInsumosPedidosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/detalleSolicitudInsumosPedidos', verifyToken, DetalleSolicitudInsumosPedidosController.findAll);
router.get('/detalleSolicitudInsumosPedidos/:id', verifyToken, DetalleSolicitudInsumosPedidosController.findOne);
router.get('/detalleSolicitudInsumosPedidosActivos', verifyToken, DetalleSolicitudInsumosPedidosController.findActivos);
router.get('/detalleSolicitudInsumosPedidos/pedidos/:id', verifyToken, DetalleSolicitudInsumosPedidosController.findOnePedido);
router.post('/detalleSolicitudInsumosPedidos', verifyToken, DetalleSolicitudInsumosPedidosValidator.create, DetalleSolicitudInsumosPedidosController.create);
router.patch('/detalleSolicitudInsumosPedidos/:id', verifyToken, DetalleSolicitudInsumosPedidosValidator.edit, DetalleSolicitudInsumosPedidosController.edit);
router.delete('/detalleSolicitudInsumosPedidos/:id', verifyToken,  DetalleSolicitudInsumosPedidosController.delete)

module.exports = router;