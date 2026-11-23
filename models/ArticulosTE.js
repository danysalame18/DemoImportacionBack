const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosTESchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    traspasosEntrada:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TraspasosEntrada'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    articulosTS:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArticulosTS'
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
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosTE = mongoose.model('ArticulosTE', articulosTESchema)
module.exports = ArticulosTE