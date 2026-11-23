const express = require ('express');
const router = express.Router();

const { ControlCalidadController } = require('../controllers')
const { ControlCalidadValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/controlCalidad', verifyToken, ControlCalidadController.findAll);
router.get('/controlCalidad/:id', verifyToken, ControlCalidadController.findOne);
router.get('/controlCalidadProveedor/:proveedor', verifyToken, ControlCalidadController.findOneProveedor);
router.get('/controlCalidadFechas/:inicio/:fin', verifyToken, ControlCalidadController.findOneFechas);
router.post('/controlCalidad', verifyToken, ControlCalidadValidator.create, ControlCalidadController.create);
router.patch('/controlCalidad/:id', verifyToken, ControlCalidadValidator.edit, ControlCalidadController.edit);
router.delete('/controlCalidad/:id', verifyToken,  ControlCalidadController.delete)
router.get('/controlCalidadCancel/:id', verifyToken,  ControlCalidadController.cancel)

module.exports = router;