const express = require ('express');
const router = express.Router();

const { ComposicionesController } = require('../controllers')
const { ComposicionesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/composiciones', verifyToken, ComposicionesController.findAll);
router.get('/composiciones/:id', verifyToken, ComposicionesController.findOne);
router.post('/composiciones', verifyToken, ComposicionesValidator.create, ComposicionesController.create);
router.patch('/composiciones/:id', verifyToken, ComposicionesValidator.edit, ComposicionesController.edit);
router.delete('/composiciones/:id', verifyToken,  ComposicionesController.delete)

module.exports = router;