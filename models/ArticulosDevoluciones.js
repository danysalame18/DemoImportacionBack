const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosDevolucionesSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    devoluciones:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Devoluciones'
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
    defectos:{
        type: Number,
        required: true
    },
    totalPiezas:{
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
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosDevoluciones = mongoose.model('ArticulosDevoluciones', articulosDevolucionesSchema)
module.exports = ArticulosDevoluciones