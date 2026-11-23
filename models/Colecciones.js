const mongoose = require ('mongoose')

const { Schema } = mongoose;

const coleccionSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    name:{
        type: String,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const Colecciones = mongoose.model('Colecciones', coleccionSchema)
module.exports = Colecciones