const mongoose = require ('mongoose')

const { Schema } = mongoose;

const conceptosGastosTiendasSchema = new Schema({
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

const ConceptosGastosTiendas = mongoose.model('ConceptosGastosTiendas', conceptosGastosTiendasSchema)
module.exports = ConceptosGastosTiendas
