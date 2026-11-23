const express = require ('express');
const router = express.Router();

const { MarcasController } = require('../controllers')
const { MarcasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/marcas', verifyToken, MarcasController.findAll);
router.get('/marcas/:id', verifyToken, MarcasController.findOne);
router.post('/marcas', verifyToken, MarcasValidator.create, MarcasController.create);
router.patch('/marcas/:id', verifyToken, MarcasValidator.edit, MarcasController.edit);
router.delete('/marcas/:id', verifyToken,  MarcasController.delete)

module.exports = router;