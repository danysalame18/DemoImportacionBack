const express = require ('express');
const router = express.Router();

const { ProcesosSalidaController } = require('../controllers')
const { ProcesosSalidaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/procesosSalida', verifyToken, ProcesosSalidaController.findAll);
router.get('/procesosSalida/:id', verifyToken, ProcesosSalidaController.findOne);
router.get('/procesosSalidaFechasActivos/:inicio/:fin', verifyToken, ProcesosSalidaController.findOneFechasActivos);
router.post('/procesosSalida', verifyToken, ProcesosSalidaValidator.create, ProcesosSalidaController.create);
router.patch('/procesosSalida/:id', verifyToken, ProcesosSalidaValidator.edit, ProcesosSalidaController.edit);
router.delete('/procesosSalida/:id', verifyToken,  ProcesosSalidaController.delete)

module.exports = router;