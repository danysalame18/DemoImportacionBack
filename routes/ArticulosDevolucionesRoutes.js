const express = require ('express');
const router = express.Router();

const { ArticulosDevolucionesController } = require('../controllers')
const { ArticulosDevolucionesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosDevoluciones', verifyToken, ArticulosDevolucionesController.findAll);
router.get('/articulosDevoluciones/:id', verifyToken, ArticulosDevolucionesController.findOne);
router.get('/articulosDevoluciones/devolucion/:id', verifyToken, ArticulosDevolucionesController.findOneDevolucion);
router.get('/articulosDevolucionesFechas/:inicio/:fin', verifyToken, ArticulosDevolucionesController.findOneFechas);
router.post('/articulosDevoluciones', verifyToken, ArticulosDevolucionesValidator.create, ArticulosDevolucionesController.create);
router.patch('/articulosDevoluciones/:id', verifyToken, ArticulosDevolucionesValidator.edit, ArticulosDevolucionesController.edit);
router.delete('/articulosDevoluciones/:id', verifyToken,  ArticulosDevolucionesController.delete)

module.exports = router;