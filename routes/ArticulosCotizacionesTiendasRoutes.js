const express = require ('express');
const router = express.Router();

const { ArticulosCotizacionesTiendasController } = require('../controllers')
const { ArticulosCotizacionesTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosCotizacionesTiendas', verifyToken, ArticulosCotizacionesTiendasController.findAll);
router.get('/articulosCotizacionesTiendas/:id', verifyToken, ArticulosCotizacionesTiendasController.findOne);
router.get('/articulosCotizacionesTiendasNota/:id', verifyToken, ArticulosCotizacionesTiendasController.findOneNota);
router.get('/articulosCotizacionesTiendas/cotizacionesTiendas/:id', verifyToken, ArticulosCotizacionesTiendasController.findOneCotizacionesTiendas);
router.get('/articulosCotizacionesTiendas/surtir/:id/:area', verifyToken, ArticulosCotizacionesTiendasController.findOnePedidoSurtir);
router.get('/articulosCotizacionesTiendas/precio/:surtido/:articulo', verifyToken, ArticulosCotizacionesTiendasController.findOnePrecio);
router.get('/articulosCotizacionesTiendas/pedidosDevolucion/:id', verifyToken, ArticulosCotizacionesTiendasController.findOnePedidoDevolucion);
router.get('/articulosCotizacionesTiendas/surtido/:id', verifyToken, ArticulosCotizacionesTiendasController.findOneSurtido);
router.get('/articulosCotizacionesTiendasDisponible', verifyToken, ArticulosCotizacionesTiendasController.findDisponible);
router.post('/articulosCotizacionesTiendas', verifyToken, ArticulosCotizacionesTiendasValidator.create, ArticulosCotizacionesTiendasController.create);
router.patch('/articulosCotizacionesTiendas/:id', verifyToken, ArticulosCotizacionesTiendasValidator.edit, ArticulosCotizacionesTiendasController.edit);
router.patch('/articulosCotizacionesTiendas/baja/:id', verifyToken, ArticulosCotizacionesTiendasValidator.edit, ArticulosCotizacionesTiendasController.editBaja);
router.delete('/articulosCotizacionesTiendas/:id', verifyToken,  ArticulosCotizacionesTiendasController.delete)

module.exports = router;