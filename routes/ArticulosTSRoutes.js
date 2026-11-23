const express = require ('express');
const router = express.Router();

const { ArticulosTSController } = require('../controllers')
const { ArticulosTSValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosTS', verifyToken, ArticulosTSController.findAll);
router.get('/articulosTS/:id', verifyToken, ArticulosTSController.findOne);
router.get('/articulosTS/traspasoSalida/:traspasoSalida', verifyToken, ArticulosTSController.findOneTraspasoSalida);
router.get('/articulosTS/reporteFechas/:inicio/:fin', verifyToken, ArticulosTSController.findReporteFechas);
router.post('/articulosTS', verifyToken, ArticulosTSValidator.create, ArticulosTSController.create);
router.patch('/articulosTS/:id', verifyToken, ArticulosTSValidator.edit, ArticulosTSController.edit);
router.patch('/articulosTS/cantidad/:id', verifyToken, ArticulosTSValidator.edit, ArticulosTSController.editCantidad);
router.delete('/articulosTS/:id', verifyToken,  ArticulosTSController.delete)

module.exports = router;