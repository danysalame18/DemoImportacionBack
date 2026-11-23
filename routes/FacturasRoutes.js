const express = require ('express');
const router = express.Router();

const { FacturasController } = require('../controllers')
const { FacturasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/facturas', verifyToken, FacturasController.findAll);
router.get('/facturas/:id', verifyToken, FacturasController.findOne);
router.get('/facturasFechas/:inicio/:fin', verifyToken, FacturasController.findOneFechas);
router.get('/facturasRelacionados/:id', verifyToken, FacturasController.findRelacionados);
router.get('/facturasCompPago/:cliente/:empresa', verifyToken, FacturasController.findOneCompPago);
router.get('/facturasCliente/:cliente', verifyToken, FacturasController.findOneCliente);
router.get('/facturasPagoFacturas', verifyToken, FacturasController.findPagoFacturas);
router.post('/facturas', verifyToken, FacturasValidator.create, FacturasController.create);
router.patch('/facturas/:id', verifyToken, FacturasValidator.edit, FacturasController.edit);
router.patch('/facturasPago/:id', verifyToken, FacturasValidator.edit, FacturasController.editPago);
router.patch('/facturasNotaCredito/:id', verifyToken, FacturasValidator.edit, FacturasController.editNotaCredito);
router.patch('/facturasLiberarSurtidos/:id', verifyToken, FacturasController.liberarSurtidos);
router.delete('/facturas/:id', verifyToken,  FacturasController.delete)

module.exports = router;