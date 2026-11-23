const { TelefonosWhatsApp } = require('../models')

module.exports = {
    findOneByTelefono : (telefono)=> TelefonosWhatsApp.findOne({ telefono }),
    findOneByTelefonoActivo : (telefono)=> TelefonosWhatsApp.findOne({ telefono, is_active: "Si" })
}
