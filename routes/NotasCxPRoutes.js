const express = require ('express');
const router = express.Router();

const { NotasCxPController } = require('../controllers')
const { NotasCxPValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/notasCxP', verifyToken, NotasCxPController.findAll);
router.get('/notasCxP/:id', verifyToken, NotasCxPController.findOne);
router.get('/notasCxPProveedor/:proveedor', verifyToken, NotasCxPController.findOneProveedor);
router.post('/notasCxP', verifyToken, NotasCxPValidator.create, NotasCxPController.create);
router.patch('/notasCxP/:id', verifyToken, NotasCxPValidator.edit, NotasCxPController.edit);
router.patch('/notasCxPeditEmbarque/:id', verifyToken, NotasCxPValidator.edit, NotasCxPController.editEmbarque);
router.delete('/notasCxP/:id', verifyToken,  NotasCxPController.delete)

module.exports = router;