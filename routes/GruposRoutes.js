const express = require ('express');
const router = express.Router();

const { GruposController } = require('../controllers')
const { GruposValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/grupos', verifyToken, GruposController.findAll);
router.get('/grupos/:id', verifyToken, GruposController.findOne);
router.post('/grupos', verifyToken, GruposValidator.create, GruposController.create);
router.patch('/grupos/:id', verifyToken, GruposValidator.edit, GruposController.edit);
router.delete('/grupos/:id', verifyToken, GruposController.delete)

module.exports = router;