const express = require ('express');
const router = express.Router();

const { CountersController } = require('../controllers')
const { verifyToken }= require('../middlewares')

router.get('/counters', verifyToken, CountersController.findAll);
router.get('/counters/:id', verifyToken, CountersController.findOne);

module.exports = router;