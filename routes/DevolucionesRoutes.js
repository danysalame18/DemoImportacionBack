const express = require ('express');
const router = express.Router();

const { DevolucionesController } = require('../controllers')
const { DevolucionesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/devoluciones', verifyToken, DevolucionesController.findAll);
router.get('/devoluciones/:id', verifyToken, DevolucionesController.findOne);
router.get('/devolucionesCliente/:cliente', verifyToken, DevolucionesController.findOneCliente);
router.get('/devolucionesColaborador/:colaborador', verifyToken, DevolucionesController.findOneColaborador);
router.get('/devolucionesColaboradorCliente/:colaborador/:cliente', verifyToken, DevolucionesController.findOneColaboradorCliente);
router.get('/devolucionesFechas/:inicio/:fin', verifyToken, DevolucionesController.findOneFechas);
router.post('/devoluciones', verifyToken, DevolucionesValidator.create, DevolucionesController.create);
router.patch('/devoluciones/:id', verifyToken, DevolucionesValidator.edit, DevolucionesController.edit);
router.delete('/devoluciones/:id', verifyToken,  DevolucionesController.delete)

module.exports = router;