const express = require ('express');
const router = express.Router();

const { FaltasColaboradoresController } = require('../controllers')
const { FaltasColaboradoresValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/faltasColaboradores', verifyToken, FaltasColaboradoresController.findAll);
router.get('/faltasColaboradores/:id', verifyToken, FaltasColaboradoresController.findOne);
router.post('/faltasColaboradores', verifyToken, FaltasColaboradoresValidator.create, FaltasColaboradoresController.create);
router.patch('/faltasColaboradores/:id', verifyToken, FaltasColaboradoresValidator.edit, FaltasColaboradoresController.edit);
router.delete('/faltasColaboradores/:id', verifyToken,  FaltasColaboradoresController.delete)

module.exports = router;