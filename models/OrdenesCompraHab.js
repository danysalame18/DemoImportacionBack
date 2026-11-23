const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ordenesCompraHabSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
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
    status:{
        type: String,
        default: "Abierto"
    },
},
    {
    timestamps: true,
    versionKey: false
});

ordenesCompraHabSchema.plugin(AutoIncrement, {inc_field: 'idOrdenCompraHab'});

const OrdenesCompraHab = mongoose.model('OrdenesCompraHab', ordenesCompraHabSchema)
module.exports = OrdenesCompraHab