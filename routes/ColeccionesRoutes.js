const express = require ('express');
const router = express.Router();

const { ColeccionesController } = require('../controllers')
const { ColeccionesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/colecciones', verifyToken, ColeccionesController.findAll);
router.get('/colecciones/:id', verifyToken, ColeccionesController.findOne);
router.post('/colecciones', verifyToken, ColeccionesValidator.create, ColeccionesController.create);
router.patch('/colecciones/:id', verifyToken, ColeccionesValidator.edit, ColeccionesController.edit);
router.delete('/colecciones/:id', verifyToken,  ColeccionesController.delete)

module.exports = router;