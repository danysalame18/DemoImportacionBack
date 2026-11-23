const express = require ('express');
const router = express.Router();

const { TraspasosSolicitudController } = require('../controllers')
const { TraspasosSolicitudValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/traspasosSolicitud', verifyToken, TraspasosSolicitudController.findAll);
router.get('/traspasosSolicitud/:id', verifyToken, TraspasosSolicitudController.findOne);
router.get('/traspasosSolicitudFechas/:inicio/:fin', verifyToken, TraspasosSolicitudController.findFechas);
router.get('/traspasosSolicitud/almacen/:almacen', verifyToken, TraspasosSolicitudController.findOneAlmacen);
router.get('/traspasosSolicitud/almacenes/:salida/:destino', verifyToken, TraspasosSolicitudController.findOneAlmacenes);
router.post('/traspasosSolicitud', verifyToken, TraspasosSolicitudValidator.create, TraspasosSolicitudController.create);
router.patch('/traspasosSolicitud/:id', verifyToken, TraspasosSolicitudValidator.edit, TraspasosSolicitudController.edit);
router.delete('/traspasosSolicitud/:id', verifyToken,  TraspasosSolicitudController.delete)

module.exports = router;