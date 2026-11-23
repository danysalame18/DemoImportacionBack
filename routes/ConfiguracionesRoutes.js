const express = require ('express');
const router = express.Router();

const { ConfiguracionesController } = require('../controllers')
const { ConfiguracionesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/configuraciones', verifyToken, ConfiguracionesController.findAll);
router.get('/configuraciones/:id', verifyToken, ConfiguracionesController.findOne);
router.post('/configuraciones', verifyToken, ConfiguracionesValidator.create, ConfiguracionesController.create);
router.patch('/configuraciones/:id', verifyToken, ConfiguracionesValidator.edit, ConfiguracionesController.edit);
router.delete('/configuraciones/:id', verifyToken,  ConfiguracionesController.delete)

module.exports = router;