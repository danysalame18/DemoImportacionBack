const express = require ('express');
const router = express.Router();

const { ArticulosProcesosSalidaController } = require('../controllers')
const { ArticulosProcesosSalidaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosProcesosSalida', verifyToken, ArticulosProcesosSalidaController.findAll);
router.get('/articulosProcesosSalida/:id', verifyToken, ArticulosProcesosSalidaController.findOne);
router.get('/articulosProcesosSalidaFechasActivos/:inicio/:fin', verifyToken, ArticulosProcesosSalidaController.findFechasActivos);
router.get('/articulosProcesosSalida/proceso/:id', verifyToken, ArticulosProcesosSalidaController.findOneProceso);
router.get('/articulosProcesosSalidaPedido/:id', verifyToken, ArticulosProcesosSalidaController.findOnePedido);
router.post('/articulosProcesosSalida', verifyToken, ArticulosProcesosSalidaValidator.create, ArticulosProcesosSalidaController.create);
router.patch('/articulosProcesosSalida/:id', verifyToken, ArticulosProcesosSalidaValidator.edit, ArticulosProcesosSalidaController.edit);
router.delete('/articulosProcesosSalida/:id', verifyToken,  ArticulosProcesosSalidaController.delete)

module.exports = router;