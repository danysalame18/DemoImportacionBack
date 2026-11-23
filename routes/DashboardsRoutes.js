const express = require ('express');
const router = express.Router();

const { DashboardsController } = require('../controllers')
const { verifyToken }= require('../middlewares')

router.get('/dashboardsInventarios', verifyToken, DashboardsController.inventarios);
router.get('/dashboardsVentas/:inicio/:fin', verifyToken, DashboardsController.ventas);
router.get('/dashboardsVentasTabla/:inicio/:fin', verifyToken, DashboardsController.ventasTabla);
router.get('/dashboardsCobranza/:inicio/:fin', verifyToken, DashboardsController.cobranza);
router.get('/dashboardsTiendas/:inicio/:fin', verifyToken, DashboardsController.tiendas);
router.get('/dashboardsCompras/:inicio/:fin', verifyToken, DashboardsController.compras);
router.get('/dashboardsGastos/:inicio/:fin', verifyToken, DashboardsController.gastos);
router.get('/dashboardsBalance', verifyToken, DashboardsController.balance);
router.get('/dashboardsAntiguedadSaldosPorCobrar', verifyToken, DashboardsController.antiguedadSaldosPorCobrar);
router.get('/dashboardsAntiguedadSaldosVencido', verifyToken, DashboardsController.antiguedadSaldosVencido);
router.get('/dashboardsAntiguedadSaldosVencidoEdoCta/:cliente', verifyToken, DashboardsController.antiguedadSaldosVencidoEdoCta);
router.get('/dashboardsUtilidadVenta/:inicio/:fin', verifyToken, DashboardsController.utilidadVenta);
router.get('/dashboardsUtilidadArticulo/:inicio/:fin', verifyToken, DashboardsController.utilidadArticulo);
router.get('/dashboardsUtilidadLinea/:inicio/:fin', verifyToken, DashboardsController.utilidadLinea);
router.get('/dashboardsUtilidadClientes/:inicio/:fin', verifyToken, DashboardsController.utilidadClientes);
router.get('/dashboardsUtilidadTiendas/:inicio/:fin', verifyToken, DashboardsController.utilidadTiendas);

module.exports = router;