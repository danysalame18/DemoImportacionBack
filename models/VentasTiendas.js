const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const ventasTiendasSchema = new Schema({
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
    paqueteria:{
        type: String,
        required: true
    },
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
    cond_pago:{
        type: String,
        required: true
    },
    fiscal:{
        type: String,
        required: true
    },
    saldo:{
        type: Number,
        required: true
    },
    cortesia:{
        type: Number,
        required: true
    },
    prefijo:{
        type: String
    },
    consecutivo:{
        type: Number
    },
    entregado:{
        type: String,
        default: "No"
    },
    descuento:{
        type: Number,
        required: true
    },
    fotoEvidencia:{
        type: String,
        default: "No"
      },

},
    {
    timestamps: true,
    versionKey: false
});

ventasTiendasSchema.plugin(AutoIncrement, {inc_field: 'idVentaTienda'});

const VentasTiendas = mongoose.model('VentasTiendas', ventasTiendasSchema)
module.exports = VentasTiendas