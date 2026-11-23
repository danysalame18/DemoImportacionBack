const express = require ('express');
const router = express.Router();

const { ConceptosGastosTiendasController } = require('../controllers')
const { ConceptosGastosTiendasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/conceptosGastosTiendas', verifyToken, ConceptosGastosTiendasController.findAll);
router.get('/conceptosGastosTiendasSeed', verifyToken, ConceptosGastosTiendasController.seed);
router.get('/conceptosGastosTiendas/:id', verifyToken, ConceptosGastosTiendasController.findOne);
router.post('/conceptosGastosTiendas', verifyToken, ConceptosGastosTiendasValidator.create, ConceptosGastosTiendasController.create);
router.patch('/conceptosGastosTiendas/:id', verifyToken, ConceptosGastosTiendasValidator.edit, ConceptosGastosTiendasController.edit);
router.delete('/conceptosGastosTiendas/:id', verifyToken, ConceptosGastosTiendasController.delete)

module.exports = router;
