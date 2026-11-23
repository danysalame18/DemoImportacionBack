const express = require ('express');
const router = express.Router();

const { AbonosController } = require('../controllers')
const { AbonosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/abonos', verifyToken, AbonosController.findAll);
router.get('/abonos/:id', verifyToken, AbonosController.findOne);
router.get('/abonosCliente/:cliente', verifyToken, AbonosController.findOneCliente);
router.get('/abonosColaborador/:colaborador', verifyToken, AbonosController.findOneColaborador);
router.get('/abonosColaboradorCliente/:colaborador/:cliente', verifyToken, AbonosController.findOneColaboradorCliente);
router.get('/abonosFechas/:inicio/:fin', verifyToken, AbonosController.findOneFechas);
router.get('/abonosCancel/:id', verifyToken, AbonosController.cancel);
router.post('/abonos', verifyToken, AbonosValidator.create, AbonosController.create);
router.post('/abonosAplicarAnticipo', verifyToken, AbonosValidator.create, AbonosController.createAplicarAnticipo);
router.patch('/abonos/:id', verifyToken, AbonosValidator.edit, AbonosController.edit);
router.patch('/abonosComision/:id', verifyToken, AbonosValidator.edit, AbonosController.editComision);
router.delete('/abonos/:id', verifyToken,  AbonosController.delete)

module.exports = router;