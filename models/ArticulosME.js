const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosMESchema = new Schema({
    muestrasEntrada:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MuestrasEntrada'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
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

const ArticulosME = mongoose.model('ArticulosME', articulosMESchema)
module.exports = ArticulosME