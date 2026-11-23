const express = require ('express');
const router = express.Router();

const { InventariosController } = require('../controllers')
const { InventariosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/inventarios', verifyToken, InventariosController.findAll);
router.get('/inventariosAcumulado', verifyToken, InventariosController.findAllAcumulado);
router.get('/inventariosAcumuladoAdmin', verifyToken, InventariosController.findAllAcumuladoAdmin);
router.get('/inventariosAcumuladoAlmacen/:almacen', verifyToken, InventariosController.findAllAcumuladoAlmacen);
router.get('/inventariosDisponibleAlmacen/:almacen', verifyToken, InventariosController.findDisponibleAlmacen);
router.get('/inventarios/:id', verifyToken, InventariosController.findOne);
router.get('/inventariosArticulo/:idArticulo/:idColor/:tono', verifyToken, InventariosController.findOneArticulo);
router.get('/inventarios/compras/:id', verifyToken, InventariosController.findOneCompra);
router.get('/inventarios/surtidos/:id', verifyToken, InventariosController.findOneSurtido);
router.get('/inventarios/devolucion/:id', verifyToken, InventariosController.findOneDevolucion);
router.get('/inventarios/surtidosDevolucion/:id', verifyToken, InventariosController.findOneSurtidoDevolucion);
router.get('/inventarios/existenciaSurtido/:id', verifyToken, InventariosController.findOneExistenciaSurtido);
router.get('/inventariosExistencia', verifyToken, InventariosController.findOneExistencia);
router.get('/inventariosDisponible', verifyToken, InventariosController.findDisponible);
router.get('/inventariosDisponiblePedidos', verifyToken, InventariosController.findDisponiblePedidos);
router.get('/inventariosDisponibleArticulo/:articulo/:cantidad', verifyToken, InventariosController.findDisponibleArticulo);
router.get('/inventariosSurtirCEDIS', verifyToken, InventariosController.findSurtirCEDIS);
router.get('/inventariosTracking/:articulo', verifyToken, InventariosController.findTracking);
router.get('/inventariosDesarrolloPendRecibir', verifyToken, InventariosController.findDesarrolloPendRecibir);
router.get('/inventarios/traspasos/:areas', verifyToken, InventariosController.findTraspasos);
router.post('/inventarios', verifyToken, InventariosValidator.create, InventariosController.create);
router.patch('/inventarios/:id', verifyToken, InventariosValidator.edit, InventariosController.edit);
router.patch('/inventarios/surtido/:id', verifyToken, InventariosValidator.edit, InventariosController.editSurtido);
router.patch('/inventarios/devolucion/:id', verifyToken, InventariosValidator.edit, InventariosController.editDevolucion);
router.patch('/inventarios/baja/:id', verifyToken, InventariosValidator.edit, InventariosController.editBaja);
router.patch('/inventariosCompra', verifyToken, InventariosValidator.edit, InventariosController.editCompra);
router.patch('/inventariosCargaInicial', verifyToken, InventariosValidator.edit, InventariosController.cargaInicial);
router.delete('/inventarios/:id', verifyToken,  InventariosController.delete)
// router.get('/inventariosDesarrollo', verifyToken,  InventariosController.desarrollo)

module.exports = router;