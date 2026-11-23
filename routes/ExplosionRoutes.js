const express = require ('express');
const router = express.Router();

const { ExplosionController } = require('../controllers')
const { ExplosionValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/explosion', verifyToken, ExplosionController.findAll);
router.get('/explosion/:id', verifyToken, ExplosionController.findOne);
router.get('/explosionCliente/:cliente', verifyToken, ExplosionController.findOneCliente);
router.post('/explosion', verifyToken, ExplosionValidator.create, ExplosionController.create);
router.patch('/explosion/:id', verifyToken, ExplosionValidator.edit, ExplosionController.edit);
router.delete('/explosion/:id', verifyToken,  ExplosionController.delete)

module.exports = router;