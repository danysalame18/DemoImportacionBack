const express = require ('express');
const router = express.Router();

const { ArticulosAjustesInvController } = require('../controllers')
const { ArticulosAjustesInvValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosAjustesInv', verifyToken, ArticulosAjustesInvController.findAll);
router.get('/articulosAjustesInv/:id', verifyToken, ArticulosAjustesInvController.findOne);
router.get('/articulosAjustesInvAjuste/:id', verifyToken, ArticulosAjustesInvController.findOneAjuste);
router.post('/articulosAjustesInv', verifyToken, ArticulosAjustesInvValidator.create, ArticulosAjustesInvController.create);
router.patch('/articulosAjustesInv/:id', verifyToken, ArticulosAjustesInvValidator.edit, ArticulosAjustesInvController.edit);
router.patch('/articulosAjustesInv/autorizado/:id', verifyToken, ArticulosAjustesInvValidator.edit, ArticulosAjustesInvController.autorizado);
router.delete('/articulosAjustesInv/:id', verifyToken,  ArticulosAjustesInvController.delete)

module.exports = router;