const express = require ('express');
const router = express.Router();

const { ProcesosEntradaController } = require('../controllers')
const { ProcesosEntradaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/procesosEntrada', verifyToken, ProcesosEntradaController.findAll);
router.get('/procesosEntrada/:id', verifyToken, ProcesosEntradaController.findOne);
router.post('/procesosEntrada', verifyToken, ProcesosEntradaValidator.create, ProcesosEntradaController.create);
router.patch('/procesosEntrada/:id', verifyToken, ProcesosEntradaValidator.edit, ProcesosEntradaController.edit);
router.delete('/procesosEntrada/:id', verifyToken,  ProcesosEntradaController.delete)

module.exports = router;