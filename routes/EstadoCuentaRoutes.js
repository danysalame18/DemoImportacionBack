const express = require ('express');
const router = express.Router();

const { EstadoCuentaController } = require('../controllers')
const { verifyToken }= require('../middlewares')

router.get('/estadoCuenta/:cliente', verifyToken, EstadoCuentaController.findOneCliente);
router.get('/estadoCuentaCXP/:proveedor', verifyToken, EstadoCuentaController.findOneProveedor);
router.get('/estadoCuentaHab/:proveedor', verifyToken, EstadoCuentaController.findOneProveedorHab);
router.get('/estadoCuentaAgrupado/:cliente', verifyToken, EstadoCuentaController.findOneClienteAgrupado);
router.get('/estadoCuentaGlobal/:cliente', verifyToken, EstadoCuentaController.findOneClienteGlobal);
router.get('/estadoCuentaTiendaAgrupado/:area', verifyToken, EstadoCuentaController.findOneTiendaAgrupado);
router.get('/estadoCuentaTienda/:cliente', verifyToken, EstadoCuentaController.findOneClienteTienda);
router.get('/estadoCuentaAnalisisClientesTiendas', verifyToken, EstadoCuentaController.analisisClientesTiendas);
router.get('/estadoCuentaAnalisisNotas', verifyToken, EstadoCuentaController.analisisNotas);
router.get('/estadoCuentaAnalisisSurtidos', verifyToken, EstadoCuentaController.analisisSurtidos);
router.get('/estadoCuentaAnalisisVentasTiendas', verifyToken, EstadoCuentaController.analisisVentasTiendas);
router.get('/estadoCuentaAnalisisNotasCargo', verifyToken, EstadoCuentaController.analisisNotasCargo);
router.get('/estadoCuentaKasher/:cliente', verifyToken, EstadoCuentaController.findOneClienteKasher);
router.get('/estadoCuentaRelacionadoKasher/:cliente', verifyToken, EstadoCuentaController.findOneClienteRelacionadoKasher);


module.exports = router;