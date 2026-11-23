const express = require ('express');
const router = express.Router();

const { TiposTelasController } = require('../controllers')
const { TiposTelasValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/tiposTelas', verifyToken, TiposTelasController.findAll);
router.get('/tiposTelas/:id', verifyToken, TiposTelasController.findOne);
router.post('/tiposTelas', verifyToken, TiposTelasValidator.create, TiposTelasController.create);
router.patch('/tiposTelas/:id', verifyToken, TiposTelasValidator.edit, TiposTelasController.edit);
router.delete('/tiposTelas/:id', verifyToken,  TiposTelasController.delete)

module.exports = router;