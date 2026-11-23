const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosProcesosEntradaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    procesosEntrada:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProcesosEntrada'
        }],
    articulosPedido:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ArticulosPedido'
        }],
    articulosProcesosSalida:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArticulosProcesosSalida'
    }],
    pedidos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedidos'
    }],
    cantidadEntrada:{
        type: Number,
    },
    cantidadFaltantes:{
        type: Number,
    },
    cantidadSegundas:{
        type: Number,
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

const ArticulosProcesosEntrada = mongoose.model('ArticulosProcesosEntrada', articulosProcesosEntradaSchema)
module.exports = ArticulosProcesosEntrada