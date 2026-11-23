const express = require('express');
const router = express.Router();

const { WhatsAppController } = require('../controllers');
const { verifyToken } = require('../middlewares');

// ---- Webhook de Meta (WhatsApp Cloud API) ----
// PÚBLICO (sin verifyToken): Meta llama estos endpoints directamente.
// Configura en Meta la URL: https://TU_DOMINIO/api/v1/whatsAppWebhook
router.get('/whatsAppWebhook', WhatsAppController.verifyWebhook);
router.post('/whatsAppWebhook', WhatsAppController.receiveWebhook);

// Catálogo de plantillas a dar de alta en Meta (protegido con JWT)
router.get('/whatsAppTemplates', verifyToken, WhatsAppController.templatesCatalog);

// Nota: se mantienen los paths tal cual los usas hoy
router.get('/whatsAppLogin', verifyToken, WhatsAppController.login);
router.get('/whatsAppStatus', verifyToken, WhatsAppController.status);
router.post('/whatsAppRestart', verifyToken, WhatsAppController.restart);
router.post('/whatsAppHardReset', verifyToken, WhatsAppController.hardReset);
router.post('/whatsAppSendMsg', verifyToken, WhatsAppController.enviarMsg);
router.post('/whatsAppSendPDF', verifyToken, WhatsAppController.sendPDF);
router.post('/whatsAppSendPDFFront', verifyToken, WhatsAppController.sendPDFFront);

module.exports = router;
