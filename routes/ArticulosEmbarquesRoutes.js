const express = require ('express');
const router = express.Router();

const { ArticulosEmbarquesController } = require('../controllers')
const { ArticulosEmbarquesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosEmbarques', verifyToken, ArticulosEmbarquesController.findAll);
router.get('/articulosEmbarques/:id', verifyToken, ArticulosEmbarquesController.findOne);
router.get('/articulosEmbarquesPendRecibir', verifyToken, ArticulosEmbarquesController.findAllPendRecibir);
router.get('/articulosEmbarquesPendRecibirDash', verifyToken, ArticulosEmbarquesController.findAllPendRecibirDash);
router.get('/articulosEmbarques/PendRecibirArticulo/:articulo', verifyToken, ArticulosEmbarquesController.findAllPendRecibirArticulo);
router.get('/articulosEmbarques/embarque/:id', verifyToken, ArticulosEmbarquesController.findOneEmbarque);
router.get('/articulosEmbarques/nota/:id', verifyToken, ArticulosEmbarquesController.findOneNota);
router.get('/articulosEmbarques/controlCalidad/:id', verifyToken, ArticulosEmbarquesController.findOneControlCalidad);
router.get('/articulosEmbarquesControlCalidadCreate', verifyToken, ArticulosEmbarquesController.findControlCalidadCreate);
router.post('/articulosEmbarques', verifyToken, ArticulosEmbarquesValidator.create, ArticulosEmbarquesController.create);
router.patch('/articulosEmbarques/:id', verifyToken, ArticulosEmbarquesValidator.edit, ArticulosEmbarquesController.edit);
router.patch('/articulosEmbarques/calidad/:id', verifyToken, ArticulosEmbarquesValidator.edit, ArticulosEmbarquesController.editCalidad);
router.patch('/articulosEmbarquesEditEmbarcado/:id', verifyToken, ArticulosEmbarquesValidator.edit, ArticulosEmbarquesController.editEmbarcado);
router.patch('/articulosEmbarquesEditCant/:id', verifyToken, ArticulosEmbarquesValidator.edit, ArticulosEmbarquesController.editCant);
router.delete('/articulosEmbarques/:id', verifyToken,  ArticulosEmbarquesController.delete)

// router.get('/articulosEmbarquesDesarrollo', verifyToken, ArticulosEmbarquesController.desarrollo);

module.exports = router;