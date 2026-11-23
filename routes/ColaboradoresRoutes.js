const express = require ('express');
const router = express.Router();

const { ColaboradoresController } = require('../controllers')
const { ColaboradoresValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/colaboradores', verifyToken, ColaboradoresController.findAll);
router.get('/colaboradores/:id', verifyToken, ColaboradoresController.findOne);
router.get('/colaboradoresVendedor', verifyToken, ColaboradoresController.findVendedor);
router.get('/colaboradores/email/:email', verifyToken, ColaboradoresController.findOneColaboradorMail);
router.post('/colaboradores', verifyToken, ColaboradoresValidator.create, ColaboradoresController.create);
router.patch('/colaboradores/:id', verifyToken, ColaboradoresValidator.edit, ColaboradoresController.edit);
router.delete('/colaboradores/:id', verifyToken, ColaboradoresController.delete)

module.exports = router;