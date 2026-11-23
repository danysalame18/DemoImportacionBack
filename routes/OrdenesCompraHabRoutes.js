const express = require ('express');
const router = express.Router();

const { OrdenesCompraHabController } = require('../controllers')
const { OrdenesCompraHabValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/ordenesCompraHab', verifyToken, OrdenesCompraHabController.findAll);
router.get('/ordenesCompraHab/:id', verifyToken, OrdenesCompraHabController.findOne);
router.post('/ordenesCompraHab', verifyToken, OrdenesCompraHabValidator.create, OrdenesCompraHabController.create);
router.patch('/ordenesCompraHab/:id', verifyToken, OrdenesCompraHabValidator.edit, OrdenesCompraHabController.edit);
router.delete('/ordenesCompraHab/:id', verifyToken,  OrdenesCompraHabController.delete)

module.exports = router;