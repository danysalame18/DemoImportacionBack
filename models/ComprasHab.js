const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const comprasHabSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    ordenesCompraHab:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrdenesCompraHab'
        }],
    factura_proveedor:{
        type: String,
        required: true
    },
    user:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    observaciones:{
        type: String,
        required: true
    },
    pais_origen:{
        type: String,
        required: true
    },
    total_metros:{
        type: Number,
        required: true
    },
    total_kilos:{
        type: Number,
        required: true
    },
    total_piezas:{
        type: Number,
        required: true
    },
    total_costo:{
        type: Number,
        required: true
    },
    saldo:{
        type: Number,
        required: true
    },
    proveedores:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedores'
    }],
},
    {
    timestamps: true,
    versionKey: false
});

comprasHabSchema.plugin(AutoIncrement, {inc_field: 'idComprasHab'});

const ComprasHab = mongoose.model('ComprasHab', comprasHabSchema)
module.exports = ComprasHab