const express = require ('express');
const router = express.Router();

const { ComprasHabController } = require('../controllers')
const { ComprasHabValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/comprasHab', verifyToken, ComprasHabController.findAll);
router.get('/comprasHab/:id', verifyToken, ComprasHabController.findOne);
router.get('/comprasHabProveedor/:proveedor', verifyToken, ComprasHabController.findOneProveedor);
router.post('/comprasHab', verifyToken, ComprasHabValidator.create, ComprasHabController.create);
router.patch('/comprasHab/:id', verifyToken, ComprasHabValidator.edit, ComprasHabController.edit);
router.delete('/comprasHab/:id', verifyToken,  ComprasHabController.delete)

module.exports = router;