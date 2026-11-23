const express = require ('express');
const router = express.Router();

const { SaldoInicialController } = require('../controllers')
const { SaldoInicialValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/saldoInicial', verifyToken, SaldoInicialController.findAll);
router.get('/saldoInicial/:id', verifyToken, SaldoInicialController.findOne);
router.get('/saldoInicialFechas/:inicio/:fin', verifyToken, SaldoInicialController.findOneFechas);
router.get('/saldoInicialCliente/:cliente', verifyToken, SaldoInicialController.findOneCliente);
router.post('/saldoInicial', verifyToken, SaldoInicialValidator.create, SaldoInicialController.create);
router.patch('/saldoInicialAplicarAbono/:id', verifyToken, SaldoInicialValidator.edit, SaldoInicialController.aplicarAbono);
router.patch('/saldoInicial/:id', verifyToken, SaldoInicialValidator.edit, SaldoInicialController.edit);
router.delete('/saldoInicial/:id', verifyToken,  SaldoInicialController.delete)

module.exports = router;