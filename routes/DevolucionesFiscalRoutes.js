const express = require ('express');
const router = express.Router();

const { DevolucionesFiscalController } = require('../controllers')
const { DevolucionesFiscalValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/devolucionesFiscal', verifyToken, DevolucionesFiscalController.findAll);
router.get('/devolucionesFiscal/:id', verifyToken, DevolucionesFiscalController.findOne);
router.get('/devolucionesFiscalFechas/:inicio/:fin', verifyToken, DevolucionesFiscalController.findOneFechas);
router.post('/devolucionesFiscal', verifyToken, DevolucionesFiscalValidator.create, DevolucionesFiscalController.create);
router.patch('/devolucionesFiscal/:id', verifyToken, DevolucionesFiscalValidator.edit, DevolucionesFiscalController.edit);
router.delete('/devolucionesFiscal/:id', verifyToken,  DevolucionesFiscalController.delete)

module.exports = router;