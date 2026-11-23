const express = require ('express');
const router = express.Router();

const { GastosTiendasController } = require('../controllers')
const { GastosTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/gastosTiendas', verifyToken, GastosTiendasController.findAll);
router.get('/gastosTiendas/:id', verifyToken, GastosTiendasController.findOne);
router.get('/gastosTiendasArea/:area', verifyToken, GastosTiendasController.findOneArea);
router.get('/gastosTiendasGastosDiario/:area/:inicio/:fin', verifyToken, GastosTiendasController.findOneGastosDiario);
router.get('/gastosTiendasGastosDiarioGeneral/:inicio/:fin', verifyToken, GastosTiendasController.findOneGastosDiarioGeneral);
router.post('/gastosTiendas', verifyToken, GastosTiendasValidator.create, GastosTiendasController.create);
router.patch('/gastosTiendas/:id', verifyToken, GastosTiendasValidator.edit, GastosTiendasController.edit);
router.delete('/gastosTiendas/:id', verifyToken,  GastosTiendasController.delete)


module.exports = router;