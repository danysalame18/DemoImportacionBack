const express = require ('express');
const router = express.Router();

const { TraspasosEntradaController } = require('../controllers')
const { TraspasosEntradaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/traspasosEntrada', verifyToken, TraspasosEntradaController.findAll);
router.get('/traspasosEntrada/:id', verifyToken, TraspasosEntradaController.findOne);
router.get('/traspasosEntradaFechas/:inicio/:fin', verifyToken, TraspasosEntradaController.findFechas);
router.post('/traspasosEntrada', verifyToken, TraspasosEntradaValidator.create, TraspasosEntradaController.create);
router.patch('/traspasosEntrada/:id', verifyToken, TraspasosEntradaValidator.edit, TraspasosEntradaController.edit);
router.delete('/traspasosEntrada/:id', verifyToken,  TraspasosEntradaController.delete)

module.exports = router;