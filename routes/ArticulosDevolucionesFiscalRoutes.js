const express = require ('express');
const router = express.Router();

const { ArticulosDevolucionesFiscalController } = require('../controllers')
const { ArticulosDevolucionesFiscalValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosDevolucionesFiscal', verifyToken, ArticulosDevolucionesFiscalController.findAll);
router.get('/articulosDevolucionesFiscal/:id', verifyToken, ArticulosDevolucionesFiscalController.findOne);
router.get('/articulosDevolucionesFiscal/devolucion/:id', verifyToken, ArticulosDevolucionesFiscalController.findOneDevolucion);
router.post('/articulosDevolucionesFiscal', verifyToken, ArticulosDevolucionesFiscalValidator.create, ArticulosDevolucionesFiscalController.create);
router.patch('/articulosDevolucionesFiscal/:id', verifyToken, ArticulosDevolucionesFiscalValidator.edit, ArticulosDevolucionesFiscalController.edit);
router.delete('/articulosDevolucionesFiscal/:id', verifyToken,  ArticulosDevolucionesFiscalController.delete)

module.exports = router;