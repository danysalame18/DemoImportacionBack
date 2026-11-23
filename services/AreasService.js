const { Areas } = require('../models')

module.exports = {
    findOneByName : (name)=> Areas.findOne({ name, is_active: true})
}
