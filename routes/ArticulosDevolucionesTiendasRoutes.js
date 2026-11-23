const express = require ('express');
const router = express.Router();

const { ArticulosDevolucionesTiendasController } = require('../controllers')
const { ArticulosDevolucionesTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosDevolucionesTiendas', verifyToken, ArticulosDevolucionesTiendasController.findAll);
router.get('/articulosDevolucionesTiendas/:id', verifyToken, ArticulosDevolucionesTiendasController.findOne);
router.get('/articulosDevolucionesTiendas/devolucionesTiendas/:id', verifyToken, ArticulosDevolucionesTiendasController.findOneDevolucionesTiendas);
router.post('/articulosDevolucionesTiendas', verifyToken, ArticulosDevolucionesTiendasValidator.create, ArticulosDevolucionesTiendasController.create);
router.patch('/articulosDevolucionesTiendas/:id', verifyToken, ArticulosDevolucionesTiendasValidator.edit, ArticulosDevolucionesTiendasController.edit);
router.delete('/articulosDevolucionesTiendas/:id', verifyToken,  ArticulosDevolucionesTiendasController.delete)

module.exports = router;