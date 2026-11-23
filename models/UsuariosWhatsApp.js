const mongoose = require ('mongoose')

const { Schema } = mongoose;

const usuarioWhatsAppSchema = new Schema({
    telefono:{
        type: Number,
        required: true
    },
    estado:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const UsuariosWhatsApp = mongoose.model('UsuariosWhatsApp', usuarioWhatsAppSchema)
module.exports = UsuariosWhatsApp