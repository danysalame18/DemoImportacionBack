const express = require ('express');
const router = express.Router();

const { GraficasController } = require('../controllers')
const { verifyToken }= require('../middlewares')


router.get('/graficas/ventaMensual/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentaMensual);
router.get('/graficas/ventaDesgloce/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentaDesgloce);
router.get('/graficas/ventaMensualComparativa/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentaMensualComparativa);
router.get('/graficas/ventaMensualCliente/:cliente/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentaMensualCliente);
router.get('/graficas/ventaDepartamento/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentasDepartamento);
router.get('/graficas/ventaVendedor/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentasVendedor);
router.get('/graficas/ventaVendedorMensual/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentasVendedorMensual);
router.get('/graficas/ventaEstado/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentasEstado);
router.get('/graficas/ventaGrupo/:fechaInicio/:fechaFin', verifyToken, GraficasController.findGraficaVentasGrupo);


module.exports = router;