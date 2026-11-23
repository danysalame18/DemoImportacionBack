const express = require ('express');
const router = express.Router();

const { TraspasosSolicitudV2Controller } = require('../controllers')
const { TraspasosSolicitudV2Validator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/traspasosSolicitudV2', verifyToken, TraspasosSolicitudV2Controller.findAll);
router.get('/traspasosSolicitudV2/:id', verifyToken, TraspasosSolicitudV2Controller.findOne);
router.get('/traspasosSolicitudV2PendienteSurtir', verifyToken, TraspasosSolicitudV2Controller.findPendienteSurtir);
router.get('/traspasosSolicitudV2Fechas/:inicio/:fin', verifyToken, TraspasosSolicitudV2Controller.findOneTraspasosSolicitudV2Fechas);
router.post('/traspasosSolicitudV2', verifyToken, TraspasosSolicitudV2Validator.create, TraspasosSolicitudV2Controller.create);
router.patch('/traspasosSolicitudV2/:id', verifyToken, TraspasosSolicitudV2Validator.edit, TraspasosSolicitudV2Controller.edit);
router.delete('/traspasosSolicitudV2/:id', verifyToken,  TraspasosSolicitudV2Controller.delete)

module.exports = router;