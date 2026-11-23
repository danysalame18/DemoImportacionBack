const express = require ('express');
const router = express.Router();

const { InsumosController } = require('../controllers')
const { InsumosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/insumos', verifyToken, InsumosController.findAll);
router.get('/insumos/:id', verifyToken, InsumosController.findOne);
router.post('/insumos', verifyToken, InsumosValidator.create, InsumosController.create);
router.patch('/insumos/:id', verifyToken, InsumosValidator.edit, InsumosController.edit);
router.delete('/insumos/:id', verifyToken,  InsumosController.delete)

module.exports = router;