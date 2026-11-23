const { Embarques } = require('../models')

module.exports = {
    findOneByContenedor : (contenedor)=> Embarques.findOne({contenedor})
}
