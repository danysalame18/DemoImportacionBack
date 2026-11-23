const express = require ('express');
const router = express.Router();

const { CuentasEmpresasController } = require('../controllers')
const { CuentasEmpresasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/cuentasEmpresas', verifyToken, CuentasEmpresasController.findAll);
router.get('/cuentasEmpresas/:id', verifyToken, CuentasEmpresasController.findOne);
router.get('/cuentasEmpresas/empresa/:empresa', verifyToken, CuentasEmpresasController.findOneEmpresa);
router.post('/cuentasEmpresas', verifyToken, CuentasEmpresasValidator.create, CuentasEmpresasController.create);
router.patch('/cuentasEmpresas/:id', verifyToken, CuentasEmpresasValidator.edit, CuentasEmpresasController.edit);
router.delete('/cuentasEmpresas/:id', verifyToken,  CuentasEmpresasController.delete)

module.exports = router;