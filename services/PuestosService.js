const { Puestos } = require('../models')

module.exports = {
    findOneByName: (name)=> Puestos.findOne({name, is_active: true})
}