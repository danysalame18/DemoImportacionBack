const express = require ('express');
const router = express.Router();

const { TraspasosDineroController } = require('../controllers')
const { TraspasosDineroValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/traspasosDinero', verifyToken, TraspasosDineroController.findAll);
router.get('/traspasosDinero/:id', verifyToken, TraspasosDineroController.findOne);
router.get('/traspasosDinerofechas/:inicio/:fin', verifyToken, TraspasosDineroController.findFechas);
router.get('/traspasosDineroArea/:area', verifyToken, TraspasosDineroController.findOneArea);
router.post('/traspasosDinero', verifyToken, TraspasosDineroValidator.create, TraspasosDineroController.create);
router.patch('/traspasosDinero/:id', verifyToken, TraspasosDineroValidator.edit, TraspasosDineroController.edit);
router.delete('/traspasosDinero/:id', verifyToken,  TraspasosDineroController.delete)


module.exports = router;