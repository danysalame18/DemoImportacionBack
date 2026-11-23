const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ordenesCompraSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    moneda:{
        type: String,
        required: true
    },
    proveedores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Proveedores'
        }],
    plazo:{
        type: Number,
        required: true
    },
    fecha_compromiso:{
        type: String,
        required: true
    },
    observaciones:{
        type: String,
        required: true
    },
    total_general:{
        type: Number,
        required: true
    },
    total_cantidad:{
        type: Number,
        required: true
    },
    embarcado:{
        type: Number,
        required: true
    },
    status:{
        type: String,
        default: "Abierto"
    },
    autorizado:{
        type: String,
        default: "No"
    },
    folioProveedor:{
        type: String,
    }
},
    {
    timestamps: true,
    versionKey: false
});

ordenesCompraSchema.plugin(AutoIncrement, {inc_field: 'idOrdenCompra'});

const OrdenesCompra = mongoose.model('OrdenesCompra', ordenesCompraSchema)
module.exports = OrdenesCompra