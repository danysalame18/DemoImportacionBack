const express = require ('express');
const router = express.Router();

const { TelefonosWhatsAppController } = require('../controllers')
const { TelefonosWhatsAppValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/telefonosWhatsApp', verifyToken, TelefonosWhatsAppController.findAll);
router.get('/telefonosWhatsApp/:id', verifyToken, TelefonosWhatsAppController.findOne);
router.post('/telefonosWhatsApp', verifyToken, TelefonosWhatsAppValidator.create, TelefonosWhatsAppController.create);
router.patch('/telefonosWhatsApp/:id', verifyToken, TelefonosWhatsAppValidator.edit, TelefonosWhatsAppController.edit);
router.delete('/telefonosWhatsApp/:id', verifyToken,  TelefonosWhatsAppController.delete)

module.exports = router;