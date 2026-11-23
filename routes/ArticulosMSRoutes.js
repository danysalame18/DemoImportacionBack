const express = require ('express');
const router = express.Router();

const { ArticulosMSController } = require('../controllers')
const { ArticulosMSValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosMS', verifyToken, ArticulosMSController.findAll);
router.get('/articulosMS/:id', verifyToken, ArticulosMSController.findOne);
router.get('/articulosMS/muestraSalida/:muestraSalida', verifyToken, ArticulosMSController.findOneMuestraSalida);
router.post('/articulosMS', verifyToken, ArticulosMSValidator.create, ArticulosMSController.create);
router.patch('/articulosMS/:id', verifyToken, ArticulosMSValidator.edit, ArticulosMSController.edit);
router.delete('/articulosMS/:id', verifyToken,  ArticulosMSController.delete)

module.exports = router;