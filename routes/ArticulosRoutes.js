const express = require ('express');
const router = express.Router();

const { ArticulosController } = require('../controllers')
const { ArticulosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulos', verifyToken, ArticulosController.findAll);
router.get('/articulosActivos', verifyToken, ArticulosController.findAllActivos);
router.get('/articulosSelect', verifyToken, ArticulosController.findAllSelect);
router.get('/articulos/:id', verifyToken, ArticulosController.findOne);
router.get('/articulosVendedores/:vendedores', verifyToken, ArticulosController.findVendedores);
router.get('/articulosProveedor/:proveedor', verifyToken, ArticulosController.findProveedor);
router.post('/articulos', verifyToken, ArticulosValidator.create, ArticulosController.create);
router.patch('/articulos/:id', verifyToken, ArticulosValidator.edit, ArticulosController.edit);
router.delete('/articulos/:id', verifyToken,  ArticulosController.delete)

module.exports = router;