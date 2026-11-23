const express = require ('express');
const router = express.Router();

const { InventariosHabController } = require('../controllers')
const { InventariosHabValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/inventariosHab', verifyToken, InventariosHabController.findAll);
router.get('/inventariosHab/:id', verifyToken, InventariosHabController.findOne);
router.post('/inventariosHab', verifyToken, InventariosHabValidator.create, InventariosHabController.create);
router.post('/inventariosHab/InsumosCreate', verifyToken, InventariosHabValidator.create, InventariosHabController.insumosCreate);
router.delete('/inventariosHab/:id', verifyToken,  InventariosHabController.delete)

module.exports = router;