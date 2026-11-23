const { Composiciones } = require('../models')

module.exports = {
    findOneByName : (name)=> Composiciones.findOne({ name, is_active: true})
}
