const { Familias } = require('../models')

module.exports = {
    findOneByName : (name)=> Familias.findOne({ name, is_active: true})
}
