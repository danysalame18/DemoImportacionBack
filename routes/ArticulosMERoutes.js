const express = require ('express');
const router = express.Router();

const { ArticulosMEController } = require('../controllers')
const { ArticulosMEValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosME', verifyToken, ArticulosMEController.findAll);
router.get('/articulosME/:id', verifyToken, ArticulosMEController.findOne);
router.get('/articulosME/muestraEntrada/:muestraEntrada', verifyToken, ArticulosMEController.findOneMuestraEntrada);
router.post('/articulosME', verifyToken, ArticulosMEValidator.create, ArticulosMEController.create);
router.patch('/articulosME/:id', verifyToken, ArticulosMEValidator.edit, ArticulosMEController.edit);
router.delete('/articulosME/:id', verifyToken,  ArticulosMEController.delete)

module.exports = router;