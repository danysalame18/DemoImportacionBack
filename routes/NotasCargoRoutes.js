const express = require ('express');
const router = express.Router();

const { NotasCargoController } = require('../controllers')
const { NotasCargoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/notasCargo', verifyToken, NotasCargoController.findAll);
router.get('/notasCargo/:id', verifyToken, NotasCargoController.findOne);
router.get('/notasCargoFechas/:inicio/:fin', verifyToken, NotasCargoController.findOneFechas);
router.get('/notasCargoCliente/:cliente', verifyToken, NotasCargoController.findOneCliente);
router.post('/notasCargo', verifyToken, NotasCargoValidator.create, NotasCargoController.create);
router.patch('/notasCargoAplicarAbono/:id', verifyToken, NotasCargoValidator.edit, NotasCargoController.aplicarAbono);
router.patch('/notasCargo/:id', verifyToken, NotasCargoValidator.edit, NotasCargoController.edit);
router.delete('/notasCargo/:id', verifyToken,  NotasCargoController.delete)

module.exports = router;