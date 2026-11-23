const { User } = require('../models')

module.exports = {
    findOneByEmail: (email)=> User.findOne({ email }),
    findOneLogin: (email)=> User.findOne({ email, is_active: "Si" })
}