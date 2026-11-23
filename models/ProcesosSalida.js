const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const procesosSalidaSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
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
    fecha:{
        type: String,
    },
    fechaCompromiso:{
        type: String,
    },
    observaciones:{
        type: String,
    },
    status:{
        type: String,
    },
    totalGeneral:{
        type: Number,
    },
    totalPiezas:{
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

procesosSalidaSchema.plugin(AutoIncrement, {inc_field: 'idProcesosSalida'});

const ProcesosSalida = mongoose.model('ProcesosSalida', procesosSalidaSchema)
module.exports = ProcesosSalida