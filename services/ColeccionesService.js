const { Colecciones } = require('../models')

module.exports = {
    findOneByName : (name)=> Colecciones.findOne({ name, is_active: true})
}
