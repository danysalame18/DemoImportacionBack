const express = require ('express');
const router = express.Router();

const { ArticulosVentasTiendasController } = require('../controllers')
const { ArticulosVentasTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosVentasTiendas', verifyToken, ArticulosVentasTiendasController.findAll);
router.get('/articulosVentasTiendas/:id', verifyToken, ArticulosVentasTiendasController.findOne);
router.get('/articulosVentasTiendasNota/:id', verifyToken, ArticulosVentasTiendasController.findOneNota);
router.get('/articulosVentasTiendas/ventasTiendas/:id', verifyToken, ArticulosVentasTiendasController.findOneVentasTiendas);
router.get('/articulosVentasTiendas/surtir/:id/:area', verifyToken, ArticulosVentasTiendasController.findOnePedidoSurtir);
router.get('/articulosVentasTiendas/precio/:surtido/:articulo', verifyToken, ArticulosVentasTiendasController.findOnePrecio);
router.get('/articulosVentasTiendas/pedidosDevolucion/:id', verifyToken, ArticulosVentasTiendasController.findOnePedidoDevolucion);
router.get('/articulosVentasTiendas/surtido/:id', verifyToken, ArticulosVentasTiendasController.findOneSurtido);
router.get('/articulosVentasTiendasDisponible', verifyToken, ArticulosVentasTiendasController.findDisponible);
router.post('/articulosVentasTiendas', verifyToken, ArticulosVentasTiendasValidator.create, ArticulosVentasTiendasController.create);
router.patch('/articulosVentasTiendas/:id', verifyToken, ArticulosVentasTiendasValidator.edit, ArticulosVentasTiendasController.edit);
router.patch('/articulosVentasTiendas/baja/:id', verifyToken, ArticulosVentasTiendasValidator.edit, ArticulosVentasTiendasController.editBaja);
router.delete('/articulosVentasTiendas/:id', verifyToken,  ArticulosVentasTiendasController.delete)
router.get('/articulosVentasTiendasAnalisis/:area/:fecha', verifyToken, ArticulosVentasTiendasController.analisis);

module.exports = router;