const express = require ('express');
const router = express.Router();

const { CotizacionesTiendasController } = require('../controllers')
const { CotizacionesTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/cotizacionesTiendas', verifyToken, CotizacionesTiendasController.findAll);
router.get('/cotizacionesTiendas/:id', verifyToken, CotizacionesTiendasController.findOne);
router.get('/cotizacionesTiendasCliente/:cliente', verifyToken, CotizacionesTiendasController.findOneCliente);
router.get('/cotizacionesTiendasCotizacionesDiario/:almacen/:inicio/:fin', verifyToken, CotizacionesTiendasController.findOneCotizacionesDiario);
router.get('/cotizacionesTiendasCotizacionesDiarioGeneral/:inicio/:fin', verifyToken, CotizacionesTiendasController.findOneCotizacionesDiarioGeneral);
router.post('/cotizacionesTiendas', verifyToken, CotizacionesTiendasValidator.create, CotizacionesTiendasController.create);
router.patch('/cotizacionesTiendas/:id', verifyToken, CotizacionesTiendasValidator.edit, CotizacionesTiendasController.edit);
router.delete('/cotizacionesTiendas/:id', verifyToken,  CotizacionesTiendasController.delete)

module.exports = router;