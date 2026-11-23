const express = require ('express');
const router = express.Router();

const { PedidosController } = require('../controllers')
const { PedidosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/pedidos', verifyToken, PedidosController.findAll);
router.get('/pedidos/:id', verifyToken, PedidosController.findOne);
router.get('/pedidosPendienteSurtir', verifyToken, PedidosController.findPendienteSurtir);
router.get('/pedidosFechas/:inicio/:fin', verifyToken, PedidosController.findOnePedidosFechas);
router.get('/pedidosFechasStatus/:inicio/:fin/:status', verifyToken, PedidosController.findOnePedidosFechasStatus);
router.get('/pedidosFechasStatusCliente/:inicio/:fin/:status/:cliente', verifyToken, PedidosController.findOnePedidosFechasStatusCliente);
router.post('/pedidos', verifyToken, PedidosValidator.create, PedidosController.create);
router.patch('/pedidos/:id', verifyToken, PedidosValidator.edit, PedidosController.edit);
router.patch('/pedidosCerrarProcesoSalida/:id', verifyToken, PedidosValidator.edit, PedidosController.editCerrarProcesoSalida);
router.patch('/pedidosAbrirProcesoSalida/:id', verifyToken, PedidosValidator.edit, PedidosController.editAbrirProcesoSalida);
router.delete('/pedidos/:id', verifyToken,  PedidosController.delete)

router.get('/pedidosDesarrollo', verifyToken, PedidosController.desarrollo);

module.exports = router;