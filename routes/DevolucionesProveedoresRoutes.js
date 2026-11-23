const express = require ('express');
const router = express.Router();

const { DevolucionesProveedoresController } = require('../controllers')
const { DevolucionesProveedoresValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/devolucionesProveedores', verifyToken, DevolucionesProveedoresController.findAll);
router.get('/devolucionesProveedores/:id', verifyToken, DevolucionesProveedoresController.findOne);
router.get('/devolucionesProveedoresProveedor/:proveedor', verifyToken, DevolucionesProveedoresController.findOneProveedor);
router.get('/devolucionesProveedoresColaborador/:colaborador', verifyToken, DevolucionesProveedoresController.findOneColaborador);
router.get('/devolucionesProveedoresColaboradorProveedor/:colaborador/:proveedor', verifyToken, DevolucionesProveedoresController.findOneColaboradorProveedor);
router.get('/devolucionesProveedoresFechas/:inicio/:fin', verifyToken, DevolucionesProveedoresController.findOneFechas);
router.post('/devolucionesProveedores', verifyToken, DevolucionesProveedoresValidator.create, DevolucionesProveedoresController.create);
router.patch('/devolucionesProveedores/:id', verifyToken, DevolucionesProveedoresValidator.edit, DevolucionesProveedoresController.edit);
router.delete('/devolucionesProveedores/:id', verifyToken,  DevolucionesProveedoresController.delete)
router.get('/devolucionesProveedoresAplicar/:id', verifyToken, DevolucionesProveedoresController.aplicar);

module.exports = router;