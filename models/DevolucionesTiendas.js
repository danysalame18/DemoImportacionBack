const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const devolucionesTiendasSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
        required: true
    },
    clientes:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clientes'
        }],
    colaboradores:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Colaboradores'
        }],
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    ventasTiendas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VentasTiendas'
    }],
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
    subTotal:{
        type: Number,
        required: true
    },
    iva:{
        type: Number,
        required: true
    },
    impuestos:{
        type: Number,
        required: true
    },
    fiscal:{
        type: String,
        required: true
    },

},
    {
    timestamps: true,
    versionKey: false
});

devolucionesTiendasSchema.plugin(AutoIncrement, {inc_field: 'idDevolucionTienda'});

const DevolucionesTiendas = mongoose.model('DevolucionesTiendas', devolucionesTiendasSchema)
module.exports = DevolucionesTiendas