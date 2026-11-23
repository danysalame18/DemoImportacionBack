const express = require ('express');
const router = express.Router();

const { ArticulosProporcionController } = require('../controllers')
const { ArticulosProporcionValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosProporcion', verifyToken, ArticulosProporcionController.findAll);
router.get('/articulosProporcion/:id', verifyToken, ArticulosProporcionController.findOne);
router.get('/articulosProporcionEliminarColor/:id', verifyToken, ArticulosProporcionController.eliminarColor);
router.get('/articulosProporcionArticulos/:articulo', verifyToken, ArticulosProporcionController.findOneArticulo);
router.post('/articulosProporcion', verifyToken, ArticulosProporcionValidator.create, ArticulosProporcionController.create);
router.patch('/articulosProporcion/:id', verifyToken, ArticulosProporcionValidator.edit, ArticulosProporcionController.edit);
router.delete('/articulosProporcion/:id', verifyToken,  ArticulosProporcionController.delete)

module.exports = router;