const express = require ('express');
const router = express.Router();

const { DevolucionesTiendasController } = require('../controllers')
const { DevolucionesTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/devolucionesTiendas', verifyToken, DevolucionesTiendasController.findAll);
router.get('/devolucionesTiendas/:id', verifyToken, DevolucionesTiendasController.findOne);
router.get('/devolucionesTiendasCliente/:cliente', verifyToken, DevolucionesTiendasController.findOneCliente);
router.get('/devolucionesTiendasDevolucionesDiario/:almacen/:inicio/:fin', verifyToken, DevolucionesTiendasController.findOneDevolucionesDiario);
router.get('/devolucionesTiendasDevolucionesDiarioGeneral/:inicio/:fin', verifyToken, DevolucionesTiendasController.findOneDevolucionesDiarioGeneral);
router.post('/devolucionesTiendas', verifyToken, DevolucionesTiendasValidator.create, DevolucionesTiendasController.create);
router.patch('/devolucionesTiendas/:id', verifyToken, DevolucionesTiendasValidator.edit, DevolucionesTiendasController.edit);
router.delete('/devolucionesTiendas/:id', verifyToken,  DevolucionesTiendasController.delete)

module.exports = router;