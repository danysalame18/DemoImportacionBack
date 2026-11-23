const express = require ('express');
const router = express.Router();

const { VentasAbyFiscalController } = require('../controllers')
const { VentasConsecutivoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ventasAbyFiscal', verifyToken, VentasAbyFiscalController.findAll);
router.get('/ventasAbyFiscal/:id', verifyToken, VentasAbyFiscalController.findOne);
router.post('/ventasAbyFiscal', verifyToken, VentasConsecutivoValidator.create, VentasAbyFiscalController.create);
router.patch('/ventasAbyFiscal/:id', verifyToken, VentasConsecutivoValidator.edit, VentasAbyFiscalController.edit);
router.delete('/ventasAbyFiscal/:id', verifyToken,  VentasAbyFiscalController.delete)

module.exports = router;