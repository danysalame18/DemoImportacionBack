const { Departamentos } = require('../models')

module.exports = {
    findOneByName : (name)=> Departamentos.findOne({ name, is_active: true})
}
