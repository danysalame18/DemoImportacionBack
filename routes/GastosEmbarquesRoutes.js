const express = require ('express');
const router = express.Router();

const { GastosEmbarquesController } = require('../controllers')
const { GastosEmbarquesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/gastosEmbarques', verifyToken, GastosEmbarquesController.findAll);
router.get('/gastosEmbarques/:id', verifyToken, GastosEmbarquesController.findOne);
router.get('/gastosEmbarquesEmbarque/:embarque', verifyToken, GastosEmbarquesController.findOneEmbarque);
router.post('/gastosEmbarques', verifyToken, GastosEmbarquesValidator.create, GastosEmbarquesController.create);
router.patch('/gastosEmbarques/:id', verifyToken, GastosEmbarquesValidator.edit, GastosEmbarquesController.edit);
router.delete('/gastosEmbarques/:id', verifyToken,  GastosEmbarquesController.delete)

module.exports = router;