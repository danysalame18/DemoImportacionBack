const express = require ('express');
const router = express.Router();

const { MuestrasSalidaController } = require('../controllers')
const { MuestrasSalidaValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/muestrasSalida', verifyToken, MuestrasSalidaController.findAll);
router.get('/muestrasSalida/:id', verifyToken, MuestrasSalidaController.findOne);
router.post('/muestrasSalida', verifyToken, MuestrasSalidaValidator.create, MuestrasSalidaController.create);
router.patch('/muestrasSalida/:id', verifyToken, MuestrasSalidaValidator.edit, MuestrasSalidaController.edit);
router.delete('/muestrasSalida/:id', verifyToken,  MuestrasSalidaController.delete)

module.exports = router;