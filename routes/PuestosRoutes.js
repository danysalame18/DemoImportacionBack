const express = require ('express');
const router = express.Router();

const { PuestosController } = require('../controllers')
const { PuestosValidator } = require('../validators')
const { verifyToken } = require('../middlewares')

router.get('/puestos', verifyToken, PuestosController.findAll);
router.get('/puestos/:id', verifyToken, PuestosController.findOne);
router.post('/puestos', verifyToken, PuestosValidator.create, PuestosController.create);
router.patch('/puestos/:id', verifyToken,  PuestosValidator.edit, PuestosController.edit);
router.delete('/puestos/:id', verifyToken, PuestosController.delete)

module.exports = router;