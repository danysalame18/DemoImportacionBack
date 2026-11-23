const express = require ('express');
const router = express.Router();

const { SeriesController } = require('../controllers')
const { SeriesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/series', verifyToken, SeriesController.findAll);
router.get('/series/:id', verifyToken, SeriesController.findOne);
router.get('/seriesTimbres', verifyToken, SeriesController.findTimbres);
router.post('/series', verifyToken, SeriesValidator.create, SeriesController.create);
router.patch('/series/:id', verifyToken, SeriesValidator.edit, SeriesController.edit);
router.delete('/series/:id', verifyToken,  SeriesController.delete)

module.exports = router;