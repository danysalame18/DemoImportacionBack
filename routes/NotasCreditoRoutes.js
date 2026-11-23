const express = require ('express');
const router = express.Router();

const { NotasCreditoController } = require('../controllers')
const { NotasCreditoValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/notasCredito', verifyToken, NotasCreditoController.findAll);
router.get('/notasCredito/:id', verifyToken, NotasCreditoController.findOne);
router.get('/notasCreditoFechas/:inicio/:fin', verifyToken, NotasCreditoController.findOneFechas);
router.post('/notasCredito', verifyToken, NotasCreditoValidator.create, NotasCreditoController.create);
router.patch('/notasCredito/:id', verifyToken, NotasCreditoValidator.edit, NotasCreditoController.edit);
router.delete('/notasCredito/:id', verifyToken,  NotasCreditoController.delete)

module.exports = router;