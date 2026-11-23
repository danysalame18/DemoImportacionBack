const express = require ('express');
const router = express.Router();

const { AnticiposController } = require('../controllers')
const { AnticiposValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/anticipos', verifyToken, AnticiposController.findAll);
router.get('/anticipos/:id', verifyToken, AnticiposController.findOne);
router.get('/anticiposFechas/:inicio/:fin', verifyToken, AnticiposController.findOneFechas);
router.get('/anticipos/cliente/:cliente', verifyToken, AnticiposController.findOneCliente);
router.get('/anticiposCancel/:id', verifyToken, AnticiposController.cancel);
router.post('/anticipos', verifyToken, AnticiposValidator.create, AnticiposController.create);
router.patch('/anticipos/:id', verifyToken, AnticiposValidator.edit, AnticiposController.edit);
router.patch('/anticiposAplicarAbono/:id', verifyToken, AnticiposValidator.edit, AnticiposController.editAplicarAbono);
router.delete('/anticipos/:id', verifyToken,  AnticiposController.delete)

module.exports = router;