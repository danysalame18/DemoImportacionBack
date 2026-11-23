const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosDevolucionesFiscalSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    devolucionesFiscal:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DevolucionesFiscal'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
        articulosSurtidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ArticulosSurtidos'
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
    areas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Areas'
        }],
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosDevolucionesFiscal = mongoose.model('ArticulosDevolucionesFiscal', articulosDevolucionesFiscalSchema)
module.exports = ArticulosDevolucionesFiscal