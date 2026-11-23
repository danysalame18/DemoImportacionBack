const express = require ('express');
const router = express.Router();

const { AjustesInventarioController } = require('../controllers')
const { AjustesInventarioValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ajustesInventario', verifyToken, AjustesInventarioController.findAll);
router.get('/ajustesInventario/:id', verifyToken, AjustesInventarioController.findOne);
router.post('/ajustesInventario', verifyToken, AjustesInventarioValidator.create, AjustesInventarioController.create);
router.patch('/ajustesInventario/:id', verifyToken, AjustesInventarioValidator.edit, AjustesInventarioController.edit);
router.patch('/ajustesInventarioCancelar/:id', verifyToken, AjustesInventarioController.cancel);
router.delete('/ajustesInventario/:id', verifyToken,  AjustesInventarioController.delete)

module.exports = router;