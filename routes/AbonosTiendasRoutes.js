const express = require ('express');
const router = express.Router();

const { AbonosTiendasController } = require('../controllers')
const { AbonosTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/abonosTiendas', verifyToken, AbonosTiendasController.findAll);
router.get('/abonosTiendas/:id', verifyToken, AbonosTiendasController.findOne);
router.get('/abonosTiendasCliente/:cliente', verifyToken, AbonosTiendasController.findOneCliente);
router.get('/abonosTiendasAbonosVentasDiario/:almacen/:inicio/:fin', verifyToken, AbonosTiendasController.findOneAbonosVentasDiario);
router.get('/abonosTiendasAbonosVentasDiarioK/:almacen/:inicio/:fin', verifyToken, AbonosTiendasController.findOneAbonosVentasDiarioK);
router.get('/abonosTiendasAbonosVentasDiarioGeneral/:inicio/:fin', verifyToken, AbonosTiendasController.findOneAbonosVentasDiarioGeneral);
router.get('/abonosTiendasCancel/:id', verifyToken, AbonosTiendasController.cancel);
router.post('/abonosTiendas', verifyToken, AbonosTiendasValidator.create, AbonosTiendasController.create);
router.patch('/abonosTiendas/:id', verifyToken, AbonosTiendasValidator.edit, AbonosTiendasController.edit);
router.delete('/abonosTiendas/:id', verifyToken,  AbonosTiendasController.delete)

module.exports = router;