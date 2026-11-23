const express = require ('express');
const router = express.Router();

const { ClientesController } = require('../controllers')
const { ClientesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/clientes', verifyToken, ClientesController.findAll);
router.get('/clientes/:id', verifyToken, ClientesController.findOne);
router.get('/clientesStatusArea/:status/:area', verifyToken, ClientesController.findStatusArea);
router.get('/clientesStatus/:status', verifyToken, ClientesController.findStatus);
router.get('/clientesGeneral', verifyToken, ClientesController.findGeneral);
router.get('/clientesGeneralActivos', verifyToken, ClientesController.findGeneralActivos);
router.get('/clientesTiendas', verifyToken, ClientesController.findTiendas);
// router.get('/clientesDashboard', verifyToken, ClientesController.findDashboard);
router.get('/clientesArea/:area', verifyToken, ClientesController.findArea);
router.get('/clientesAreaActivos/:area', verifyToken, ClientesController.findAreaActivos);
router.get('/clientes/email/:email', verifyToken, ClientesController.findOneClienteMail);
router.get('/clientesLogin/:user', ClientesController.login);
router.post('/clientes', verifyToken, ClientesValidator.create, ClientesController.create);
router.patch('/clientes/:id', verifyToken, ClientesValidator.edit, ClientesController.edit);
router.patch('/clientesSeguimientoCobranza/:id', verifyToken, ClientesValidator.seguimientoCobranza, ClientesController.seguimientoCobranza);
router.delete('/clientesSeguimientoCobranza/:id/:idSeguimiento', verifyToken, ClientesController.borrarSeguimientoCobranza);
router.delete('/clientes/:id', verifyToken, ClientesController.delete)

module.exports = router;