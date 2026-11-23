const express = require ('express');
const router = express.Router();

const { HabOCController } = require('../controllers')
const { HabOCValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/habOC', verifyToken, HabOCController.findAll);
router.get('/habOC/:id', verifyToken, HabOCController.findOne);
router.get('/habOC/ordenesCompraHab/:id', verifyToken, HabOCController.findOneOrden);
router.post('/habOC', verifyToken, HabOCValidator.create, HabOCController.create);
router.patch('/habOC/:id', verifyToken, HabOCValidator.edit, HabOCController.edit);
router.patch('/habOCeditRecibido/:id', verifyToken, HabOCValidator.edit, HabOCController.editRecibido);
router.patch('/habOC/baja/:id', verifyToken, HabOCValidator.edit, HabOCController.editBaja);
router.delete('/habOC/:id', verifyToken,  HabOCController.delete)

module.exports = router;