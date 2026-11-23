const express = require ('express');
const router = express.Router();

const { ArticulosTSolV2Controller } = require('../controllers')
const { ArticulosTSolV2Validator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosTSolV2', verifyToken, ArticulosTSolV2Controller.findAll);
router.get('/articulosTSolV2/:id', verifyToken, ArticulosTSolV2Controller.findOne);
router.get('/articulosTSolV2Articulo/:id', verifyToken, ArticulosTSolV2Controller.findOneArticulo);
router.get('/articulosTSolV2/traspasosSolicitud/:id', verifyToken, ArticulosTSolV2Controller.findOneTraspasosSolicitud);
router.get('/articulosTSolV2/surtir2/:id', verifyToken, ArticulosTSolV2Controller.findOneTraspasosSolicitudSurtir2);
router.get('/articulosTSolV2/surtir3/:id/:area', verifyToken, ArticulosTSolV2Controller.findOneTraspasosSolicitudSurtir3);
router.get('/articulosTSolV2/surtir4/:id/:area', verifyToken, ArticulosTSolV2Controller.findOneTraspasosSolicitudSurtir4);
router.get('/articulosTSolV2/surtir/:id/:area', verifyToken, ArticulosTSolV2Controller.findOneTraspasosSolicitudSurtir);
router.get('/articulosTSolV2/precio/:surtido/:articulo', verifyToken, ArticulosTSolV2Controller.findOnePrecio);
router.get('/articulosTSolV2/traspasosSolicitudDevolucion/:id', verifyToken, ArticulosTSolV2Controller.findOneTraspasosSolicitudDevolucion);
router.get('/articulosTSolV2/surtido/:id', verifyToken, ArticulosTSolV2Controller.findOneSurtido);
router.get('/articulosTSolV2Disponible', verifyToken, ArticulosTSolV2Controller.findDisponible);
router.post('/articulosTSolV2', verifyToken, ArticulosTSolV2Validator.create, ArticulosTSolV2Controller.create);
router.patch('/articulosTSolV2/:id', verifyToken, ArticulosTSolV2Validator.edit, ArticulosTSolV2Controller.edit);
router.patch('/articulosTSolV2/baja/:id', verifyToken, ArticulosTSolV2Validator.edit, ArticulosTSolV2Controller.editBaja);
router.patch('/articulosTSolV2/autorizadoApartado/:id', verifyToken, ArticulosTSolV2Validator.edit, ArticulosTSolV2Controller.editAutorizadoApartado);
router.patch('/articulosTSolV2/autorizadoSurtido/:id', verifyToken, ArticulosTSolV2Validator.edit, ArticulosTSolV2Controller.editAutorizadoSurtido);
router.delete('/articulosTSolV2/:id', verifyToken,  ArticulosTSolV2Controller.delete)

module.exports = router;