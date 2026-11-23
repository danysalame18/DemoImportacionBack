const express = require ('express');
const router = express.Router();

const { VentasBenyController } = require('../controllers')
const { VentasConsecutivoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ventasBeny', verifyToken, VentasBenyController.findAll);
router.get('/ventasBeny/:id', verifyToken, VentasBenyController.findOne);
router.post('/ventasBeny', verifyToken, VentasConsecutivoValidator.create, VentasBenyController.create);
router.patch('/ventasBeny/:id', verifyToken, VentasConsecutivoValidator.edit, VentasBenyController.edit);
router.delete('/ventasBeny/:id', verifyToken,  VentasBenyController.delete)

module.exports = router;