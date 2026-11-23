const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosOCSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    ordenesCompra:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrdenesCompra'
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
    embarcado:{
        type: Number,
        required: true
    },
    pendiente_embarcar:{
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
    }
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosOC = mongoose.model('ArticulosOC', articulosOCSchema)
module.exports = ArticulosOC