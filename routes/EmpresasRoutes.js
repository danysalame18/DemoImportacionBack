const express = require ('express');
const router = express.Router();

const { EmpresasController } = require('../controllers')
const { EmpresasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/empresas', verifyToken, EmpresasController.findAll);
router.get('/empresas/:id', verifyToken, EmpresasController.findOne);
router.post('/empresas', verifyToken, EmpresasValidator.create, EmpresasController.create);
router.patch('/empresas/:id', verifyToken, EmpresasValidator.edit, EmpresasController.edit);
router.delete('/empresas/:id', verifyToken,  EmpresasController.delete)

module.exports = router;