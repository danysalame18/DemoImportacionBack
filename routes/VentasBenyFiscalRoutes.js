const express = require ('express');
const router = express.Router();

const { VentasBenyFiscalController } = require('../controllers')
const { VentasConsecutivoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ventasBenyFiscal', verifyToken, VentasBenyFiscalController.findAll);
router.get('/ventasBenyFiscal/:id', verifyToken, VentasBenyFiscalController.findOne);
router.post('/ventasBenyFiscal', verifyToken, VentasConsecutivoValidator.create, VentasBenyFiscalController.create);
router.patch('/ventasBenyFiscal/:id', verifyToken, VentasConsecutivoValidator.edit, VentasBenyFiscalController.edit);
router.delete('/ventasBenyFiscal/:id', verifyToken,  VentasBenyFiscalController.delete)

module.exports = router;