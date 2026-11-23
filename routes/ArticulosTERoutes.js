const express = require ('express');
const router = express.Router();

const { ArticulosTEController } = require('../controllers')
const { ArticulosTEValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosTE', verifyToken, ArticulosTEController.findAll);
router.get('/articulosTE/:id', verifyToken, ArticulosTEController.findOne);
router.get('/articulosTE/traspasoEntrada/:traspasoEntrada', verifyToken, ArticulosTEController.findOneTraspasoEntrada);
router.post('/articulosTE', verifyToken, ArticulosTEValidator.create, ArticulosTEController.create);
router.patch('/articulosTE/:id', verifyToken, ArticulosTEValidator.edit, ArticulosTEController.edit);
router.delete('/articulosTE/:id', verifyToken,  ArticulosTEController.delete)

module.exports = router;