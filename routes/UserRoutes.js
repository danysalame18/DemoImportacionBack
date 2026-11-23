const express = require ('express');
const router = express.Router();

const { UserController } = require('../controllers')
const { UserValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/users', verifyToken, UserController.findAll);
router.get('/listaUsers', verifyToken, UserController.findUsuarios);
router.get('/users/:id', verifyToken, UserController.findOne);
router.get('/usersStatus/:status', verifyToken, UserController.findStatus);
router.get('/users/email/:email', verifyToken, UserController.findOneFamilia);
router.get('/users/cliente/:id', verifyToken, UserController.findOneClientePassword);
router.get('/users/familia/:id', verifyToken, UserController.findOneFamiliaPassword);
router.post('/users', verifyToken, UserValidator.create, UserController.signup);
router.patch('/users/:id', verifyToken, UserValidator.edit, UserController.edit);
router.patch('/users/passwordUser/:id', verifyToken, UserValidator.edit, UserController.passwordUser);
router.patch('/users/passwordCliente/:id', verifyToken, UserValidator.edit, UserController.passwordCliente);
router.delete('/users/:id', verifyToken, UserController.delete)

module.exports = router;