const express = require ('express');
const router = express.Router();

const { NominasController } = require('../controllers')
const { NominasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/nominas', verifyToken, NominasController.findAll);
router.get('/nominas/:id', verifyToken, NominasController.findOne);
router.post('/nominas', verifyToken, NominasValidator.create, NominasController.create);
router.patch('/nominas/:id', verifyToken, NominasValidator.edit, NominasController.edit);
router.delete('/nominas/:id', verifyToken, NominasController.delete)

module.exports = router;