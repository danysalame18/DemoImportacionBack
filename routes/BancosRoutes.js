const express = require ('express');
const router = express.Router();

const { BancosController } = require('../controllers')
const { BancosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/bancos', verifyToken, BancosController.findAll);
router.get('/bancos/:id', verifyToken, BancosController.findOne);
router.post('/bancos', verifyToken, BancosValidator.create, BancosController.create);
router.patch('/bancos/:id', verifyToken, BancosValidator.edit, BancosController.edit);
router.delete('/bancos/:id', verifyToken,  BancosController.delete)

module.exports = router;