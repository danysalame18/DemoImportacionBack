const express = require ('express');
const router = express.Router();

const { ColoresController } = require('../controllers')
const { NameValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/colores', verifyToken, ColoresController.findAll);
router.get('/colores/:id', verifyToken, ColoresController.findOne);
router.post('/colores', verifyToken, NameValidator.create, ColoresController.create);
router.patch('/colores/:id', verifyToken, NameValidator.edit, ColoresController.edit);
router.delete('/colores/:id', verifyToken,  ColoresController.delete)

module.exports = router;