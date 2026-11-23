const express = require ('express');
const router = express.Router();

const { ArticulosOCController } = require('../controllers')
const { ArticulosOCValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosOC', verifyToken, ArticulosOCController.findAll);
router.get('/articulosOC/PendEmbarcar', verifyToken, ArticulosOCController.findAllPendEmbarcar);
router.get('/articulosOC/PendEmbarcarDash', verifyToken, ArticulosOCController.findAllPendEmbarcarDash);
router.get('/articulosOC/PendRecibirArticulo/:articulo', verifyToken, ArticulosOCController.findAllPendRecibirArticulo);
router.get('/articulosOC/:id', verifyToken, ArticulosOCController.findOne);
router.get('/articulosOC/ordenesCompra/:id', verifyToken, ArticulosOCController.findOneOrden);
router.post('/articulosOC', verifyToken, ArticulosOCValidator.create, ArticulosOCController.create);
router.patch('/articulosOC/:id', verifyToken, ArticulosOCValidator.edit, ArticulosOCController.edit);
router.patch('/articulosOCeditEmbarcado/:id', verifyToken, ArticulosOCValidator.edit, ArticulosOCController.editEmbarcado);
router.patch('/articulosOCeditEmbarcadoCant/:id', verifyToken, ArticulosOCValidator.edit, ArticulosOCController.editEmbarcadoCant);
router.patch('/articulosOC/baja/:id', verifyToken, ArticulosOCValidator.edit, ArticulosOCController.editBaja);
router.delete('/articulosOC/:id', verifyToken,  ArticulosOCController.delete)
router.get('/articulosOCFindAllInfoArt', verifyToken,  ArticulosOCController.findAllInfoArt)

module.exports = router;