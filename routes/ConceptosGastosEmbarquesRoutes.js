const express = require ('express');
const router = express.Router();

const { ConceptosGastosEmbarquesController } = require('../controllers')
const { ConceptosGastosEmbarquesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/conceptosGastosEmbarques', verifyToken, ConceptosGastosEmbarquesController.findAll);
router.get('/conceptosGastosEmbarquesFijos', verifyToken, ConceptosGastosEmbarquesController.findAllFijos);
router.get('/conceptosGastosEmbarques/:id', verifyToken, ConceptosGastosEmbarquesController.findOne);
router.post('/conceptosGastosEmbarques', verifyToken, ConceptosGastosEmbarquesValidator.create, ConceptosGastosEmbarquesController.create);
router.patch('/conceptosGastosEmbarques/:id', verifyToken, ConceptosGastosEmbarquesValidator.edit, ConceptosGastosEmbarquesController.edit);
router.delete('/conceptosGastosEmbarques/:id', verifyToken,  ConceptosGastosEmbarquesController.delete)

module.exports = router;