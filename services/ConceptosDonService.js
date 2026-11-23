const { ConceptosDon } = require('../models')

module.exports = {
    findOneByName : (name)=> ConceptosDon.findOne({ name, is_active: true})
}
