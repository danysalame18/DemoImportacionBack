const { Articulos } = require('../models')

module.exports = {
    findOneByName : (codigo)=> Articulos.findOne({ codigo, is_active: true})
}
