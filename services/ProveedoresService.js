const { Proveedores } = require('../models')

module.exports = {
    findOneByRFC: (RFC)=> Proveedores.findOne({ RFC, is_active: true})
}