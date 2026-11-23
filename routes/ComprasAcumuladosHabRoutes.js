const express = require ('express');
const router = express.Router();

const { ComprasAcumuladosHabController } = require('../controllers')
const { ComprasAcumuladosHabValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/comprasAcumuladosHab', verifyToken, ComprasAcumuladosHabController.findAll);
router.get('/comprasAcumuladosHab/:id', verifyToken, ComprasAcumuladosHabController.findOne);
router.get('/comprasAcumuladosHab/compra/:id', verifyToken, ComprasAcumuladosHabController.findOneCompra);
router.post('/comprasAcumuladosHab', verifyToken, ComprasAcumuladosHabValidator.create, ComprasAcumuladosHabController.create);
router.patch('/comprasAcumuladosHab/:id', verifyToken, ComprasAcumuladosHabValidator.edit, ComprasAcumuladosHabController.edit);
router.delete('/comprasAcumuladosHab/:id', verifyToken,  ComprasAcumuladosHabController.delete)

module.exports = router;