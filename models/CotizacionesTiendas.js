const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const cotizacionesTiendasSchema = new Schema({
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
    comisionTDC:{
        type: Number,
        required: true
    },
    comisionFlete:{
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
    vendido:{
        type: String,
        default: "No"
    },

},
    {
    timestamps: true,
    versionKey: false
});

cotizacionesTiendasSchema.plugin(AutoIncrement, {inc_field: 'idCotizacionTienda'});

const CotizacionesTiendas = mongoose.model('CotizacionesTiendas', cotizacionesTiendasSchema)
module.exports = CotizacionesTiendas