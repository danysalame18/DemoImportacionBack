const express = require ('express');
const router = express.Router();

const { BrokersController } = require('../controllers')
const { BrokersValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/brokers', verifyToken, BrokersController.findAll);
router.get('/brokers/:id', verifyToken, BrokersController.findOne);
router.post('/brokers', verifyToken, BrokersValidator.create, BrokersController.create);
router.patch('/brokers/:id', verifyToken, BrokersValidator.edit, BrokersController.edit);
router.delete('/brokers/:id', verifyToken, BrokersController.delete)

module.exports = router;