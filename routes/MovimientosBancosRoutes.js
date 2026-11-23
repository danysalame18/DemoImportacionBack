const express = require ('express');
const router = express.Router();

const { MovimientosBancosController } = require('../controllers')
const { MovimientosBancosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/movimientosBancos', verifyToken, MovimientosBancosController.findAll);
router.get('/movimientosBancos/:id', verifyToken, MovimientosBancosController.findOne);
router.get('/movimientosBancosbanco/:banco', verifyToken, MovimientosBancosController.findOneBanco);
router.get('/movimientosBancosFechas/:inicio/:fin', verifyToken, MovimientosBancosController.findOneFechas);
router.post('/movimientosBancos', verifyToken, MovimientosBancosValidator.create, MovimientosBancosController.create);
router.patch('/movimientosBancos/:id', verifyToken, MovimientosBancosValidator.edit, MovimientosBancosController.edit);
router.delete('/movimientosBancos/:id', verifyToken,  MovimientosBancosController.delete)

module.exports = router;