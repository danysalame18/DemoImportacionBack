const express = require ('express');
const router = express.Router();

const { ArticulosSurtidosController } = require('../controllers')
const { ArticulosSurtidosValidator } = require('../validators')
const { verifyToken }= require('../middlewares')

router.get('/articulosSurtidos', verifyToken, ArticulosSurtidosController.findAll);
router.get('/articulosSurtidos/:id', verifyToken, ArticulosSurtidosController.findOne);
router.get('/articulosSurtidos/surtido/:id', verifyToken, ArticulosSurtidosController.findOneSurtido);
router.get('/articulosSurtidos/clienteDevolucion/:id', verifyToken, ArticulosSurtidosController.findOneClienteDevolucion);
router.get('/articulosSurtidos/inventario/:id', verifyToken, ArticulosSurtidosController.findOneInventario);
router.get('/articulosSurtidosFechas/:inicio/:fin', verifyToken, ArticulosSurtidosController.findOneFechas);
router.post('/articulosSurtidos', verifyToken, ArticulosSurtidosValidator.create, ArticulosSurtidosController.create);
router.patch('/articulosSurtidos/:id', verifyToken, ArticulosSurtidosValidator.edit, ArticulosSurtidosController.edit);
router.delete('/articulosSurtidos/:id', verifyToken,  ArticulosSurtidosController.delete)
router.get('/articulosSurtidosFactura/:id', verifyToken, ArticulosSurtidosController.findOneFactura);

// router.get('/articulosSurtidosDesarrollo', verifyToken, ArticulosSurtidosController.desarrollo);

module.exports = router;