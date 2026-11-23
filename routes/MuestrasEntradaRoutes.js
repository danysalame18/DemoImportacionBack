const express = require ('express');
const router = express.Router();

const { MuestrasEntradaController } = require('../controllers')
const { MuestrasEntradaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/muestrasEntrada', verifyToken, MuestrasEntradaController.findAll);
router.get('/muestrasEntrada/:id', verifyToken, MuestrasEntradaController.findOne);
router.post('/muestrasEntrada', verifyToken, MuestrasEntradaValidator.create, MuestrasEntradaController.create);
router.patch('/muestrasEntrada/:id', verifyToken, MuestrasEntradaValidator.edit, MuestrasEntradaController.edit);
router.delete('/muestrasEntrada/:id', verifyToken,  MuestrasEntradaController.delete)

module.exports = router;