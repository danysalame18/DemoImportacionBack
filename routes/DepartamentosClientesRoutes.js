const express = require ('express');
const router = express.Router();

const { DepartamentosClientesController } = require('../controllers')
const { DepartamentosClientesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/departamentosClientes', verifyToken, DepartamentosClientesController.findAll);
router.get('/departamentosClientes/:id', verifyToken, DepartamentosClientesController.findOne);
router.post('/departamentosClientes', verifyToken, DepartamentosClientesValidator.create, DepartamentosClientesController.create);
router.patch('/departamentosClientes/:id', verifyToken, DepartamentosClientesValidator.edit, DepartamentosClientesController.edit);
router.delete('/departamentosClientes/:id', verifyToken,  DepartamentosClientesController.delete)

module.exports = router;