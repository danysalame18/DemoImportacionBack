const express = require ('express');
const router = express.Router();

const { ProveedoresController } = require('../controllers')
const { ProveedoresValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/proveedores', verifyToken, ProveedoresController.findAll);
router.get('/proveedores/:id', verifyToken, ProveedoresController.findOne);
router.get('/proveedoresTipo/:tipo', verifyToken, ProveedoresController.findTipo);
router.post('/proveedores', verifyToken, ProveedoresValidator.create, ProveedoresController.create);
router.patch('/proveedores/:id', verifyToken, ProveedoresValidator.edit, ProveedoresController.edit);
router.delete('/proveedores/:id', verifyToken, ProveedoresController.delete)

module.exports = router;