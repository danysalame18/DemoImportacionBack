const express = require ('express');
const router = express.Router();

const { ComisionesController } = require('../controllers')
const { ComisionesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/comisiones', verifyToken, ComisionesController.findAll);
router.get('/comisiones/:id', verifyToken, ComisionesController.findOne);
router.get('/comisiones/colaborador/:colaborador', verifyToken, ComisionesController.findOneColaborador);
router.get('/comisionesFechas/:inicio/:fin', verifyToken, ComisionesController.findOneFechas);
router.get('/comisionesCancel/:id', verifyToken, ComisionesController.cancel);
router.post('/comisiones', verifyToken, ComisionesValidator.create, ComisionesController.create);
router.patch('/comisiones/:id', verifyToken, ComisionesValidator.edit, ComisionesController.edit);
router.patch('/comisionesEditImporte/:id', verifyToken, ComisionesValidator.edit, ComisionesController.editImporte);
router.patch('/comisionesPagar/:id', verifyToken, ComisionesValidator.edit, ComisionesController.editPagar);
router.delete('/comisiones/:id', verifyToken,  ComisionesController.delete)

module.exports = router;