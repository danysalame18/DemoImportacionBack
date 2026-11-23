const express = require ('express');
const router = express.Router();

const { InsumosPedidosController } = require('../controllers')
const { InsumosPedidosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/insumosPedidos', verifyToken, InsumosPedidosController.findAll);
router.get('/insumosPedidos/:id', verifyToken, InsumosPedidosController.findOne);
router.post('/insumosPedidos', verifyToken, InsumosPedidosValidator.create, InsumosPedidosController.create);
router.patch('/insumosPedidos/:id', verifyToken, InsumosPedidosValidator.edit, InsumosPedidosController.edit);
router.delete('/insumosPedidos/:id', verifyToken,  InsumosPedidosController.delete)

module.exports = router;