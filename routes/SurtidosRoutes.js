const express = require ('express');
const router = express.Router();

const { SurtidosController } = require('../controllers')
const { SurtidosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/surtidos', verifyToken, SurtidosController.findAll);
router.get('/surtidos/:id', verifyToken, SurtidosController.findOne);
router.get('/surtidosNoEvidencia', verifyToken, SurtidosController.findNoEvidencia);
router.get('/surtidosFechas/:inicio/:fin', verifyToken, SurtidosController.findOneFechas);
router.get('/surtidosCliente/:cliente', verifyToken, SurtidosController.findOneCliente);
router.get('/surtidosColaborador/:colaborador', verifyToken, SurtidosController.findOneColaborador);
router.get('/surtidosColaboradorCliente/:colaborador/:cliente', verifyToken, SurtidosController.findOneColaboradorCliente);
router.get('/surtidosCalificadoraCliente/:cliente', verifyToken, SurtidosController.findCalificadoraCliente);
router.get('/surtidosClienteEdoCta/:cliente', verifyToken, SurtidosController.findOneClienteEdoCta);
router.get('/surtidosClienteDevolucion/:cliente', verifyToken, SurtidosController.findOneClienteDevolucion);
router.post('/surtidos', verifyToken, SurtidosValidator.create, SurtidosController.create);
router.post('/surtidosCompleto', verifyToken, SurtidosController.createCompleto);
router.patch('/surtidos/:id', verifyToken, SurtidosValidator.edit, SurtidosController.edit);
router.get('/surtidosCancel/:id', verifyToken, SurtidosController.cancel);
router.delete('/surtidos/:id', verifyToken,  SurtidosController.delete)
router.get('/surtidosFactura/:factura', verifyToken, SurtidosController.findOneFactura);
router.get('/surtidosFacturacion/:cliente', verifyToken, SurtidosController.findOneFacturacion);
// router.get('/surtidosFacturacion/:cliente/:empresa', verifyToken, SurtidosController.findOneFacturacion);
router.patch('/surtidosFactura/:id', verifyToken, SurtidosValidator.edit, SurtidosController.editFactura);

// router.get('/surtidosDesarrollo', verifyToken, SurtidosController.desarrollo);

module.exports = router;