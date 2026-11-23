const express = require ('express');
const router = express.Router();

const { ConceptosGastosController } = require('../controllers')
const { ConceptosGastosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/conceptosGastos', verifyToken, ConceptosGastosController.findAll);
router.get('/conceptosGastos/:id', verifyToken, ConceptosGastosController.findOne);
router.post('/conceptosGastos', verifyToken, ConceptosGastosValidator.create, ConceptosGastosController.create);
router.patch('/conceptosGastos/:id', verifyToken, ConceptosGastosValidator.edit, ConceptosGastosController.edit);
router.delete('/conceptosGastos/:id', verifyToken,  ConceptosGastosController.delete)

module.exports = router;