const express = require ('express');
const router = express.Router();

const { LogsController } = require('../controllers')
const { LogsValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/logs', verifyToken, LogsController.findAll);
router.get('/logs/:id', verifyToken, LogsController.findOne);
router.post('/logs', verifyToken, LogsValidator.create, LogsController.create);
router.patch('/logs/:id', verifyToken, LogsValidator.edit, LogsController.edit);
router.delete('/logs/:id', verifyToken,  LogsController.delete)

module.exports = router;