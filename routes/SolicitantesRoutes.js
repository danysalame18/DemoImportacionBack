const express = require ('express');
const router = express.Router();

const { SolicitantesController } = require('../controllers')
const { NameValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/solicitantes', verifyToken, SolicitantesController.findAll);
router.get('/solicitantes/:id', verifyToken, SolicitantesController.findOne);
router.post('/solicitantes', verifyToken, NameValidator.create, SolicitantesController.create);
router.patch('/solicitantes/:id', verifyToken, NameValidator.edit, SolicitantesController.edit);
router.delete('/solicitantes/:id', verifyToken,  SolicitantesController.delete)

module.exports = router;