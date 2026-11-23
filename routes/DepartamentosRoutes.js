const express = require ('express');
const router = express.Router();

const { DepartamentosController } = require('../controllers')
const { DepartamentosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/departamentos', verifyToken, DepartamentosController.findAll);
router.get('/departamentos/:id', verifyToken, DepartamentosController.findOne);
router.post('/departamentos', verifyToken, DepartamentosValidator.create, DepartamentosController.create);
router.patch('/departamentos/:id', verifyToken, DepartamentosValidator.edit, DepartamentosController.edit);
router.delete('/departamentos/:id', verifyToken,  DepartamentosController.delete)

module.exports = router;