const express = require ('express');
const router = express.Router();

const { VentasAbyController } = require('../controllers')
const { VentasConsecutivoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ventasAby', verifyToken, VentasAbyController.findAll);
router.get('/ventasAby/:id', verifyToken, VentasAbyController.findOne);
router.post('/ventasAby', verifyToken, VentasConsecutivoValidator.create, VentasAbyController.create);
router.patch('/ventasAby/:id', verifyToken, VentasConsecutivoValidator.edit, VentasAbyController.edit);
router.delete('/ventasAby/:id', verifyToken,  VentasAbyController.delete)

module.exports = router;