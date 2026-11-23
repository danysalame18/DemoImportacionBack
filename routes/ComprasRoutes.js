const express = require ('express');
const router = express.Router();

const { ComprasController } = require('../controllers')
const { ComprasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/compras', verifyToken, ComprasController.findAll);
router.get('/compras/:id', verifyToken, ComprasController.findOne);
router.get('/comprasFechas/:inicio/:fin', verifyToken, ComprasController.findOneFechas);
router.post('/compras', verifyToken, ComprasValidator.create, ComprasController.create);
router.patch('/compras/:id', verifyToken, ComprasValidator.edit, ComprasController.edit);
router.patch('/comprasRolloEdit/:id', verifyToken, ComprasValidator.edit, ComprasController.editRollo);
router.delete('/compras/:id', verifyToken,  ComprasController.delete)

module.exports = router;