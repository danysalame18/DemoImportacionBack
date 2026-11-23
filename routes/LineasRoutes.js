const express = require ('express');
const router = express.Router();

const { LineasController } = require('../controllers')
const { LineasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/lineas', verifyToken, LineasController.findAll);
router.get('/lineas/:id', verifyToken, LineasController.findOne);
router.post('/lineas', verifyToken, LineasValidator.create, LineasController.create);
router.patch('/lineas/:id', verifyToken, LineasValidator.edit, LineasController.edit);
router.delete('/lineas/:id', verifyToken,  LineasController.delete)

module.exports = router;