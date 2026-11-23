const { Marcas } = require('../models')

module.exports = {
    findOneByName : (name)=> Marcas.findOne({ name, is_active: true})
}
