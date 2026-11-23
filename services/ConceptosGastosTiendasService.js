const { ConceptosGastosTiendas } = require('../models')

module.exports = {
    findOneByName : (name)=> ConceptosGastosTiendas.findOne({ name, is_active: "Si" })
}
