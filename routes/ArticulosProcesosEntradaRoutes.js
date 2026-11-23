const express = require ('express');
const router = express.Router();

const { ArticulosProcesosEntradaController } = require('../controllers')
const { ArticulosProcesosEntradaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosProcesosEntrada', verifyToken, ArticulosProcesosEntradaController.findAll);
router.get('/articulosProcesosEntrada/:id', verifyToken, ArticulosProcesosEntradaController.findOne);
router.get('/articulosProcesosEntrada/proceso/:id', verifyToken, ArticulosProcesosEntradaController.findOneProceso);
router.get('/articulosProcesosEntradaPedido/:id', verifyToken, ArticulosProcesosEntradaController.findOnePedido);
router.post('/articulosProcesosEntrada', verifyToken, ArticulosProcesosEntradaValidator.create, ArticulosProcesosEntradaController.create);
router.patch('/articulosProcesosEntrada/:id', verifyToken, ArticulosProcesosEntradaValidator.edit, ArticulosProcesosEntradaController.edit);
router.delete('/articulosProcesosEntrada/:id', verifyToken,  ArticulosProcesosEntradaController.delete)

module.exports = router;