const express = require ('express');
const router = express.Router();

const { FamiliasController } = require('../controllers')
const { FamiliasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/familias', verifyToken, FamiliasController.findAll);
router.get('/familias/:id', verifyToken, FamiliasController.findOne);
router.post('/familias', verifyToken, FamiliasValidator.create, FamiliasController.create);
router.patch('/familias/:id', verifyToken, FamiliasValidator.edit, FamiliasController.edit);
router.delete('/familias/:id', verifyToken,  FamiliasController.delete)

module.exports = router;