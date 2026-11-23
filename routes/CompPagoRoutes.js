const express = require ('express');
const router = express.Router();

const { CompPagoController } = require('../controllers')
const { CompPagoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/compPago', verifyToken, CompPagoController.findAll);
router.get('/compPago/:id', verifyToken, CompPagoController.findOne);
router.get('/compPagoFechas/:inicio/:fin', verifyToken, CompPagoController.findOneFechas);
router.post('/compPago', verifyToken, CompPagoValidator.create, CompPagoController.create);
router.patch('/compPago/:id', verifyToken, CompPagoValidator.edit, CompPagoController.edit);
router.delete('/compPago/:id', verifyToken,  CompPagoController.delete)

module.exports = router;