const express = require ('express');
const router = express.Router();

const { AbonosProveedoresController } = require('../controllers')
const { AbonosProveedoresValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/abonosProveedores', verifyToken, AbonosProveedoresController.findAll);
router.get('/abonosProveedores/:id', verifyToken, AbonosProveedoresController.findOne);
router.get('/abonosProveedoresProveedor/:proveedor', verifyToken, AbonosProveedoresController.findOneProveedor);
router.get('/abonosProveedoresFechas/:inicio/:fin', verifyToken, AbonosProveedoresController.findOneFechas);
router.post('/abonosProveedores', verifyToken, AbonosProveedoresValidator.create, AbonosProveedoresController.create);
router.patch('/abonosProveedores/:id', verifyToken, AbonosProveedoresValidator.edit, AbonosProveedoresController.edit);
router.delete('/abonosProveedores/:id', verifyToken,  AbonosProveedoresController.delete)

module.exports = router;