const express = require ('express');
const router = express.Router();

const { AbonosFacturasController } = require('../controllers')
const { AbonosFacturasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/abonosFacturas', verifyToken, AbonosFacturasController.findAll);
router.get('/abonosFacturas/:id', verifyToken, AbonosFacturasController.findOne);
router.get('/abonosFacturasCliente/:cliente', verifyToken, AbonosFacturasController.findOneCliente);
router.get('/abonosFacturasColaborador/:colaborador', verifyToken, AbonosFacturasController.findOneColaborador);
router.get('/abonosFacturasFechas/:inicio/:fin', verifyToken, AbonosFacturasController.findOneFechas);
router.get('/abonosFacturasCancel/:id', verifyToken, AbonosFacturasController.cancel);
router.post('/abonosFacturas', verifyToken, AbonosFacturasValidator.create, AbonosFacturasController.create);
router.patch('/abonosFacturas/:id', verifyToken, AbonosFacturasValidator.edit, AbonosFacturasController.edit);
router.delete('/abonosFacturas/:id', verifyToken,  AbonosFacturasController.delete)

module.exports = router;