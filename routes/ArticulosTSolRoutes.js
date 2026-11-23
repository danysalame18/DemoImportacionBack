const express = require ('express');
const router = express.Router();

const { ArticulosTSolController } = require('../controllers')
const { ArticulosTSolValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosTSol', verifyToken, ArticulosTSolController.findAll);
router.get('/articulosTSol/:id', verifyToken, ArticulosTSolController.findOne);
router.get('/articulosTSol/traspasoSolicitud/:traspasoSolicitud', verifyToken, ArticulosTSolController.findOneTraspasoSolicitud);
router.get('/articulosTSol/solicitud/:id/:area', verifyToken, ArticulosTSolController.findOneSolicitud);
router.post('/articulosTSol', verifyToken, ArticulosTSolValidator.create, ArticulosTSolController.create);
router.patch('/articulosTSol/:id', verifyToken, ArticulosTSolValidator.edit, ArticulosTSolController.edit);
router.patch('/articulosTSol/cantidad/:id', verifyToken, ArticulosTSolValidator.edit, ArticulosTSolController.editCantidad);
router.delete('/articulosTSol/:id', verifyToken,  ArticulosTSolController.delete)

module.exports = router;