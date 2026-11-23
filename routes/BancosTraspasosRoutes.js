const express = require ('express');
const router = express.Router();

const { BancosTraspasosController } = require('../controllers')
const { BancosTraspasosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/bancosTraspasos', verifyToken, BancosTraspasosController.findAll);
router.get('/bancosTraspasos/:id', verifyToken, BancosTraspasosController.findOne);
router.post('/bancosTraspasos', verifyToken, BancosTraspasosValidator.create, BancosTraspasosController.create);
router.patch('/bancosTraspasos/:id', verifyToken, BancosTraspasosValidator.edit, BancosTraspasosController.edit);
router.delete('/bancosTraspasos/:id', verifyToken,  BancosTraspasosController.delete)

module.exports = router;