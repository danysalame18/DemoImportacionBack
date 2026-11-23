const express = require ('express');
const router = express.Router();

const { TimbrarController } = require('../controllers')
const { verifyToken }= require('../middlewares')

router.post('/timbrarRegistrarEmpresa', verifyToken, TimbrarController.registrarEmpresa);
router.post('/timbrarFactura', verifyToken, TimbrarController.timbrarFactura);
router.post('/timbrarCompPago', verifyToken, TimbrarController.timbrarCompPago);
router.post('/timbrarNotaCredito', verifyToken, TimbrarController.timbrarNotaCredito);
router.post('/timbrarDevolucionesFiscal', verifyToken, TimbrarController.timbrarDevolucionesFiscal);
router.get('/timbrarObtenerPDF/:idFacturama', verifyToken, TimbrarController.obtenerPDF);
router.get('/timbrarObtenerXML/:idFacturama', verifyToken, TimbrarController.obtenerXML);
router.patch('/timbrarCancelFactura/:id/:idFacturama', verifyToken, TimbrarController.cancelFactura);
router.patch('/timbrarCancelCompPago/:id/:idFacturama', verifyToken, TimbrarController.cancelCompPago);
router.patch('/timbrarCancelNotaCredito/:id/:idFacturama', verifyToken, TimbrarController.cancelNotaCredito);
router.patch('/timbrarCancelDevolucionFiscal/:id/:idFacturama', verifyToken, TimbrarController.cancelDevolucionFiscal);


module.exports = router;