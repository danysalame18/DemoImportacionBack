const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosDevolucionesTiendasSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    devolucionesTiendas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DevolucionesTiendas'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    cantidad:{
        type: Number,
        required: true
    },
    precio:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    costoUnitario:{
        type: Number,
        default: 0
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosDevolucionesTiendas = mongoose.model('ArticulosDevolucionesTiendas', articulosDevolucionesTiendasSchema)
module.exports = ArticulosDevolucionesTiendas