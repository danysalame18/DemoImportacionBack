const express = require ('express');
const router = express.Router();

const { SubCategoriasController } = require('../controllers')
const { SubCategoriasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/subCategorias', verifyToken, SubCategoriasController.findAll);
router.get('/subCategorias/:id', verifyToken, SubCategoriasController.findOne);
router.post('/subCategorias', verifyToken, SubCategoriasValidator.create, SubCategoriasController.create);
router.patch('/subCategorias/:id', verifyToken, SubCategoriasValidator.edit, SubCategoriasController.edit);
router.delete('/subCategorias/:id', verifyToken,  SubCategoriasController.delete)

module.exports = router;