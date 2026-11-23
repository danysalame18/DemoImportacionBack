const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosMSSchema = new Schema({
    muestrasSalida:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MuestrasSalida'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    inventarios:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventarios'
    }],
    cantidad:{
        type: Number,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosMS = mongoose.model('ArticulosMS', articulosMSSchema)
module.exports = ArticulosMS