const mongoose = require ('mongoose')

const { Schema } = mongoose;

const marcaSchema = new Schema({
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

const Marcas = mongoose.model('Marcas', marcaSchema)
module.exports = Marcas