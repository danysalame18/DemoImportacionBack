const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const devolucionesSchema = new Schema({
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
    surtidos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Surtidos'
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
    aplicada:{
        type: String,
        default: "No"
    },
    comisionPagada:{
        type: String,
        default: "No"
      },
    comisiones: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comisiones",
    },
    ],
},
    {
    timestamps: true,
    versionKey: false
});

devolucionesSchema.plugin(AutoIncrement, {inc_field: 'idDevolucion'});

const Devoluciones = mongoose.model('Devoluciones', devolucionesSchema)
module.exports = Devoluciones