const express = require ('express');
const router = express.Router();

const { DetalleInsumosPedidosController } = require('../controllers')
const { DetalleInsumosPedidosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/detalleInsumosPedidos', verifyToken, DetalleInsumosPedidosController.findAll);
router.get('/detalleInsumosPedidos/:id', verifyToken, DetalleInsumosPedidosController.findOne);
router.get('/detalleInsumosPedidos/pedido/:id', verifyToken, DetalleInsumosPedidosController.findOnePedido);
router.get('/detalleInsumosPedidosFechas/:inicio/:fin', verifyToken, DetalleInsumosPedidosController.findOneFechas);
router.post('/detalleInsumosPedidos', verifyToken, DetalleInsumosPedidosValidator.create, DetalleInsumosPedidosController.create);
router.patch('/detalleInsumosPedidos/:id', verifyToken, DetalleInsumosPedidosValidator.edit, DetalleInsumosPedidosController.edit);
router.delete('/detalleInsumosPedidos/:id', verifyToken,  DetalleInsumosPedidosController.delete)

module.exports = router;