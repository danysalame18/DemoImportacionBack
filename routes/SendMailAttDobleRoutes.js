const express = require ('express');
const router = express.Router();

const { SendMailAttDobleController } = require('../controllers')
const { verifyToken }= require('../middlewares')

router.post('/sendMailAttDoble', verifyToken, SendMailAttDobleController.create);

module.exports = router;