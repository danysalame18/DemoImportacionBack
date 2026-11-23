const express = require ('express');
const router = express.Router();

const { SeguimientosController } = require('../controllers')
const { verifyToken }= require('../middlewares')

router.get('/seguimientos/:articulo', verifyToken, SeguimientosController.findAll);
router.get('/seguimientosKardex/:articulo/:area', verifyToken, SeguimientosController.findKardex);
router.get('/seguimientosSellThru/:articulo', verifyToken, SeguimientosController.findSellThru);
router.get('/seguimientosSellThruArea/:area/:articulo', verifyToken, SeguimientosController.findSellThruArea);
router.get('/seguimientosSellThruAreaGlobal/:inicio/:fin/:area', verifyToken, SeguimientosController.findSellThruAreaGlobal);
router.get('/seguimientosUltimoPrecio/:cliente', verifyToken, SeguimientosController.findUltimoPrecio);
router.get('/seguimientosUltimoPrecioArticulo/:articulo', verifyToken, SeguimientosController.findUltimoPrecioArticulo);
router.get('/seguimientosCuadrarInventario/:area', verifyToken, SeguimientosController.cuadrarInventario);

router.get('/seguimientosVerificarInventario/:area', verifyToken, SeguimientosController.verificarInventario);

module.exports = router;