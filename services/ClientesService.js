const { Clientes } = require('../models')

module.exports = {
    findOneByCodigo: (codigo)=> Clientes.findOne({codigo})
}