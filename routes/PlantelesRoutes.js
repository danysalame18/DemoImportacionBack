const express = require ('express');
const router = express.Router();

const { PlantelesController } = require('../controllers')
const { PlantelesValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/planteles', verifyToken, PlantelesController.findAll);
router.get('/planteles/:id', verifyToken, PlantelesController.findOne);
router.post('/planteles', verifyToken, PlantelesValidator.create, PlantelesController.create);
router.patch('/planteles/:id', verifyToken, PlantelesValidator.edit, PlantelesController.edit);
router.delete('/planteles/:id', verifyToken,  PlantelesController.delete)

module.exports = router;