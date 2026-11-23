const express = require ('express');
const router = express.Router();

const { ArticulosDevolucionesProveedoresController } = require('../controllers')
const { ArticulosDevolucionesProveedoresValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosDevolucionesProveedores', verifyToken, ArticulosDevolucionesProveedoresController.findAll);
router.get('/articulosDevolucionesProveedores/:id', verifyToken, ArticulosDevolucionesProveedoresController.findOne);
router.get('/articulosDevolucionesProveedores/devolucion/:id', verifyToken, ArticulosDevolucionesProveedoresController.findOneDevolucion);
router.post('/articulosDevolucionesProveedores', verifyToken, ArticulosDevolucionesProveedoresValidator.create, ArticulosDevolucionesProveedoresController.create);
router.patch('/articulosDevolucionesProveedores/:id', verifyToken, ArticulosDevolucionesProveedoresValidator.edit, ArticulosDevolucionesProveedoresController.edit);
router.delete('/articulosDevolucionesProveedores/:id', verifyToken,  ArticulosDevolucionesProveedoresController.delete)

module.exports = router;