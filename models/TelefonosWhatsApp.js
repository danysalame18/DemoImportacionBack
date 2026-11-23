const mongoose = require ('mongoose')

const { Schema } = mongoose;

const telefonosWhatsAppSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    },
    telefono:{
        type: Number,
        required: true
    },
    tipo:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const TelefonosWhatsApp = mongoose.model('TelefonosWhatsApp', telefonosWhatsAppSchema)
module.exports = TelefonosWhatsApp