const express = require ('express');
const router = express.Router();

const { GastosGeneralController } = require('../controllers')
const { GastosGeneralValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/gastosGeneral', verifyToken, GastosGeneralController.findAll);
router.get('/gastosGeneral/:id', verifyToken, GastosGeneralController.findOne);
router.get('/gastosGeneralArea/:area', verifyToken, GastosGeneralController.findOneArea);
router.get('/gastosGeneralGastosDiario/:area/:inicio/:fin', verifyToken, GastosGeneralController.findOneGastosDiario);
router.get('/gastosGeneralGastosDiarioGeneral/:inicio/:fin', verifyToken, GastosGeneralController.findOneGastosDiarioGeneral);
router.post('/gastosGeneral', verifyToken, GastosGeneralValidator.create, GastosGeneralController.create);
router.patch('/gastosGeneral/:id', verifyToken, GastosGeneralValidator.edit, GastosGeneralController.edit);
router.get('/gastosGeneralCancel/:id', verifyToken, GastosGeneralController.cancel);
router.delete('/gastosGeneral/:id', verifyToken,  GastosGeneralController.delete)


module.exports = router;