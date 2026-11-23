const { DepartamentosClientes } = require('../models')

module.exports = {
    findOneByName : (name)=> DepartamentosClientes.findOne({ name, is_active: true})
}
