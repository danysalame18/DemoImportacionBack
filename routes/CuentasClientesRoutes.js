const express = require ('express');
const router = express.Router();

const { CuentasClientesController } = require('../controllers')
const { CuentasClientesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/cuentasClientes', verifyToken, CuentasClientesController.findAll);
router.get('/cuentasClientes/:id', verifyToken, CuentasClientesController.findOne);
router.get('/cuentasClientes/cliente/:cliente', verifyToken, CuentasClientesController.findOneCliente);
router.post('/cuentasClientes', verifyToken, CuentasClientesValidator.create, CuentasClientesController.create);
router.patch('/cuentasClientes/:id', verifyToken, CuentasClientesValidator.edit, CuentasClientesController.edit);
router.delete('/cuentasClientes/:id', verifyToken,  CuentasClientesController.delete)

module.exports = router;