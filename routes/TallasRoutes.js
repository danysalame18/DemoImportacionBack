const express = require ('express');
const router = express.Router();

const { TallasController } = require('../controllers')
const { NameValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/tallas', verifyToken, TallasController.findAll);
router.get('/tallas/:id', verifyToken, TallasController.findOne);
router.post('/tallas', verifyToken, NameValidator.create, TallasController.create);
router.patch('/tallas/:id', verifyToken, NameValidator.edit, TallasController.edit);
router.delete('/tallas/:id', verifyToken,  TallasController.delete)

module.exports = router;