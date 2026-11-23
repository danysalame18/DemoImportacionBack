const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosProcesosSalidaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    procesosSalida:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcesosSalida'
        }],
    articulosPedido:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ArticulosPedido'
        }],
    pedidos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedidos'
    }],
    cantidadSalida:{
        type: Number,
    },
    cantidadEntrada:{
        type: Number,
    },
    faltantes:{
        type: Number,
        default: 0
    },
    faltantesHab:{
        type: Number,
        default: 0
    },
    segundas:{
        type: Number,
        default: 0
    },
    proveedores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedores'
        }],
    fecha:{
        type: String,
        required: true,
    },
    precio:{
        type: Number,
        default: 0
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosProcesosSalida = mongoose.model('ArticulosProcesosSalida', articulosProcesosSalidaSchema)
module.exports = ArticulosProcesosSalida