const express = require ('express');
const router = express.Router();

const { AreasController } = require('../controllers')
const { AreasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/areas', verifyToken, AreasController.findAll);
router.get('/areas/:id', verifyToken, AreasController.findOne);
router.post('/areas', verifyToken, AreasValidator.create, AreasController.create);
router.patch('/areas/:id', verifyToken, AreasValidator.edit, AreasController.edit);
router.delete('/areas/:id', verifyToken,  AreasController.delete)

module.exports = router;