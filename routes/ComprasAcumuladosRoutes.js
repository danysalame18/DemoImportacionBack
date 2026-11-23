const express = require ('express');
const router = express.Router();

const { ComprasAcumuladosController } = require('../controllers')
const { ComprasAcumuladosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/comprasAcumulados', verifyToken, ComprasAcumuladosController.findAll);
router.get('/comprasAcumulados/:id', verifyToken, ComprasAcumuladosController.findOne);
router.get('/comprasAcumulados/compra/:id', verifyToken, ComprasAcumuladosController.findOneCompra);
router.get('/comprasAcumuladosFechas/:inicio/:fin', verifyToken, ComprasAcumuladosController.findOneFechas);
router.post('/comprasAcumulados', verifyToken, ComprasAcumuladosValidator.create, ComprasAcumuladosController.create);
router.patch('/comprasAcumulados/:id', verifyToken, ComprasAcumuladosValidator.edit, ComprasAcumuladosController.edit);
router.delete('/comprasAcumulados/:id', verifyToken,  ComprasAcumuladosController.delete)

module.exports = router;