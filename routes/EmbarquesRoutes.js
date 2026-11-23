const express = require ('express');
const router = express.Router();

const { EmbarquesController } = require('../controllers')
const { EmbarquesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/embarques', verifyToken, EmbarquesController.findAll);
router.get('/embarques/:id', verifyToken, EmbarquesController.findOne);
// router.get('/embarquesProveedor/:proveedor', verifyToken, EmbarquesController.findOneProveedor);
router.post('/embarques', verifyToken, EmbarquesValidator.create, EmbarquesController.create);
router.patch('/embarques/:id', verifyToken, EmbarquesValidator.edit, EmbarquesController.edit);
router.patch('/embarquesEditArticulos/:id', verifyToken, EmbarquesController.editArticulos);
router.delete('/embarques/:id', verifyToken,  EmbarquesController.delete)

module.exports = router;