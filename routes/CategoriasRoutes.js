const express = require ('express');
const router = express.Router();

const { CategoriasController } = require('../controllers')
const { NameValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/categorias', verifyToken, CategoriasController.findAll);
router.get('/categorias/:id', verifyToken, CategoriasController.findOne);
router.post('/categorias', verifyToken, NameValidator.create, CategoriasController.create);
router.patch('/categorias/:id', verifyToken, NameValidator.edit, CategoriasController.edit);
router.delete('/categorias/:id', verifyToken,  CategoriasController.delete)

module.exports = router;