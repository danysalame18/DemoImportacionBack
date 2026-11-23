const express = require ('express');
const router = express.Router();

const { ArticulosPedidoController } = require('../controllers')
const { ArticulosPedidoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosPedido', verifyToken, ArticulosPedidoController.findAll);
router.get('/articulosPedido/:id', verifyToken, ArticulosPedidoController.findOne);
router.get('/articulosPedidoAnalisis', verifyToken, ArticulosPedidoController.findAnalisis);
router.get('/articulosPedidoArticulo/:id', verifyToken, ArticulosPedidoController.findOneArticulo);
router.get('/articulosPedidoFechas/:inicio/:fin', verifyToken, ArticulosPedidoController.findOneFechas);
router.get('/articulosPedido/pedidos/:id', verifyToken, ArticulosPedidoController.findOnePedido);
router.get('/articulosPedido/surtir2/:id', verifyToken, ArticulosPedidoController.findOnePedidoSurtir2);
router.get('/articulosPedido/surtir3/:id/:area', verifyToken, ArticulosPedidoController.findOnePedidoSurtir3);
router.get('/articulosPedido/surtir4/:id/:area', verifyToken, ArticulosPedidoController.findOnePedidoSurtir4);
router.get('/articulosPedido/surtir/:id', verifyToken, ArticulosPedidoController.findOnePedidoSurtir);
router.get('/articulosPedido/precio/:surtido/:articulo', verifyToken, ArticulosPedidoController.findOnePrecio);
router.get('/articulosPedidoListoSurtir', verifyToken, ArticulosPedidoController.findListoSurtir);
router.get('/articulosPedidoListoSurtirBodegas', verifyToken, ArticulosPedidoController.findListoSurtirBodegas);
router.get('/articulosPedidoListoSurtirCliente/:cliente', verifyToken, ArticulosPedidoController.findListoSurtirCliente);
router.get('/articulosPedido/pedidosDevolucion/:id', verifyToken, ArticulosPedidoController.findOnePedidoDevolucion);
router.get('/articulosPedido/surtido/:id', verifyToken, ArticulosPedidoController.findOneSurtido);
router.get('/articulosPedidoDisponible', verifyToken, ArticulosPedidoController.findDisponible);
router.post('/articulosPedido', verifyToken, ArticulosPedidoValidator.create, ArticulosPedidoController.create);
router.patch('/articulosPedido/:id', verifyToken, ArticulosPedidoValidator.edit, ArticulosPedidoController.edit);
router.patch('/articulosPedido/baja/:id', verifyToken, ArticulosPedidoValidator.edit, ArticulosPedidoController.editBaja);
router.patch('/articulosPedido/autorizadoApartado/:id', verifyToken, ArticulosPedidoValidator.edit, ArticulosPedidoController.editAutorizadoApartado);
router.patch('/articulosPedido/autorizadoSurtido/:id', verifyToken, ArticulosPedidoValidator.edit, ArticulosPedidoController.editAutorizadoSurtido);
router.delete('/articulosPedido/:id', verifyToken,  ArticulosPedidoController.delete)

module.exports = router;