const express = require ('express');
const router = express.Router();

const { AbonosTraspasosController } = require('../controllers')
const { AbonosTraspasosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/abonosTraspasos', verifyToken, AbonosTraspasosController.findAll);
router.get('/abonosTraspasos/:id', verifyToken, AbonosTraspasosController.findOne);
router.get('/abonosTraspasosArea/:area', verifyToken, AbonosTraspasosController.findOneArea);
router.get('/abonosTraspasosFechas/:inicio/:fin', verifyToken, AbonosTraspasosController.findOneFechas);
router.get('/abonosTraspasosCancel/:id', verifyToken, AbonosTraspasosController.cancel);
router.post('/abonosTraspasos', verifyToken, AbonosTraspasosValidator.create, AbonosTraspasosController.create);
router.patch('/abonosTraspasos/:id', verifyToken, AbonosTraspasosValidator.edit, AbonosTraspasosController.edit);
router.delete('/abonosTraspasos/:id', verifyToken,  AbonosTraspasosController.delete)

module.exports = router;