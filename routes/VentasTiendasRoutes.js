const express = require ('express');
const router = express.Router();

const { VentasTiendasController } = require('../controllers')
const { VentasTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ventasTiendas', verifyToken, VentasTiendasController.findAll);
router.get('/ventasTiendas/:id', verifyToken, VentasTiendasController.findOne);
router.get('/ventasTiendasCliente/:cliente', verifyToken, VentasTiendasController.findOneCliente);
router.get('/ventasTiendasClienteAbono/:cliente', verifyToken, VentasTiendasController.findOneClienteAbono);
router.get('/ventasTiendasClienteDevolucion/:cliente', verifyToken, VentasTiendasController.findOneClienteDevolucion);
router.get('/ventasTiendasVentasDiario/:almacen/:inicio/:fin', verifyToken, VentasTiendasController.findOneVentasDiario);
router.get('/ventasTiendasCorte/:almacen/:inicio/:fin', verifyToken, VentasTiendasController.findOneCorte);
router.get('/ventasTiendasCorteK/:almacen/:inicio/:fin', verifyToken, VentasTiendasController.findOneCorteK);
router.get('/ventasTiendasVentasDiarioGeneral/:inicio/:fin', verifyToken, VentasTiendasController.findOneVentasDiarioGeneral);
router.get('/ventasTiendasPendienteSurtir', verifyToken, VentasTiendasController.findPendienteSurtir);
router.post('/ventasTiendas', verifyToken, VentasTiendasValidator.create, VentasTiendasController.create);
router.patch('/ventasTiendas/:id', verifyToken, VentasTiendasValidator.edit, VentasTiendasController.edit);
router.get('/ventasTiendasCancel/:id', verifyToken, VentasTiendasController.cancel);
router.delete('/ventasTiendas/:id', verifyToken,  VentasTiendasController.delete)

module.exports = router;