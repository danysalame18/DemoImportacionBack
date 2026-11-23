const express = require ('express');
const router = express.Router();

const { SendMailAttController } = require('../controllers')
const { verifyToken }= require('../middlewares')

router.post('/sendMailAtt', verifyToken, SendMailAttController.create);

module.exports = router;