const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const procesosEntradaSchema = new Schema({
    proveedores:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedores'
    }],
    pedidos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pedidos'
    }],
    procesosSalida:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcesosSalida'
    }],
    fecha:{
        type: String,
    },
    observaciones:{
        type: String,
    },
    totalGeneral:{
        type: Number,
    },
    totalPiezas:{
        type: Number,
    },
    totalPiezasFaltantes:{
        type: Number,
    },
    totalPiezasSegundas:{
        type: Number,
    },
    precio:{
        type: Number,
    },
},
    {
    timestamps: true,
    versionKey: false
});

procesosEntradaSchema.plugin(AutoIncrement, {inc_field: 'idProcesosEntrada'});

const ProcesosEntrada = mongoose.model('ProcesosEntrada', procesosEntradaSchema)
module.exports = ProcesosEntrada