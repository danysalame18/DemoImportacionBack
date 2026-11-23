const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosAjustesInvSchema = new Schema({
    ajustesInventario:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AjustesInventario'
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

const ArticulosAjustesInv = mongoose.model('ArticulosAjustesInv', articulosAjustesInvSchema)
module.exports = ArticulosAjustesInv