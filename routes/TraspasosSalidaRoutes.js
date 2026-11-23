const express = require ('express');
const router = express.Router();

const { TraspasosSalidaController } = require('../controllers')
const { TraspasosSalidaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/traspasosSalida', verifyToken, TraspasosSalidaController.findAll);
router.get('/traspasosSalida/:id', verifyToken, TraspasosSalidaController.findOne);
router.get('/traspasosSalidaFechas/:inicio/:fin', verifyToken, TraspasosSalidaController.findFechas);
router.get('/traspasosSalida/almacen/:almacen', verifyToken, TraspasosSalidaController.findOneAlmacen);
router.get('/traspasosSalidaAreaPagar/:area', verifyToken, TraspasosSalidaController.findOneAreaPagar);
router.post('/traspasosSalida', verifyToken, TraspasosSalidaValidator.create, TraspasosSalidaController.create);
router.patch('/traspasosSalida/:id', verifyToken, TraspasosSalidaValidator.edit, TraspasosSalidaController.edit);
router.patch('/traspasosSalidaCancelar/:id', verifyToken, TraspasosSalidaController.cancelar);
router.delete('/traspasosSalida/:id', verifyToken,  TraspasosSalidaController.delete)

module.exports = router;