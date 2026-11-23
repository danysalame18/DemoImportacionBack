const express = require ('express');
const router = express.Router();

const { OrdenesCompraController } = require('../controllers')
const { OrdenesCompraValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ordenesCompra', verifyToken, OrdenesCompraController.findAll);
router.get('/ordenesCompra/:id', verifyToken, OrdenesCompraController.findOne);
router.get('/ordenesCompraFechas/:inicio/:fin', verifyToken, OrdenesCompraController.findOneFechas);
router.get('/ordenesCompraFechasStatus/:inicio/:fin/:status', verifyToken, OrdenesCompraController.findOneFechasStatus);
router.post('/ordenesCompra', verifyToken, OrdenesCompraValidator.create, OrdenesCompraController.create);
router.patch('/ordenesCompra/:id', verifyToken, OrdenesCompraValidator.edit, OrdenesCompraController.edit);
router.delete('/ordenesCompra/:id', verifyToken,  OrdenesCompraController.delete)

module.exports = router;