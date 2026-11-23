const { Lineas } = require('../models')

module.exports = {
    findOneByName : (name)=> Lineas.findOne({ name, is_active: true})
}
