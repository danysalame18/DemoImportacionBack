const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const surtidosSchema = new Schema({
    is_active:{
        type: String
    },
    fecha:{
        type: String,
        required: true
    },
    pedidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedidos'
        }],
    clientes:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clientes'
        }],
    user:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    colaboradores:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colaboradores'
    }],
    observaciones:{
        type: String,
        required: true
    },
    total_general:{
        type: Number,
        required: true
    },
    saldo:{
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
    total_cantidad:{
        type: Number,
    },
    impuestos:{
        type: Number,
        required: true
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
    fotoEvidencia:{
        type: String,
        default: "No"
      },
    mail:{
        type: String,
        default: "No"
    },
    noFactura:{
        type: String,
        default: "Sin Factura"
    },
    noGuia:{
        type: String,
        default: "Sin Guia"
    },
    salidaBodega:{
        type: String,
    },
    plazo:{
        type: Number,
        required: true
    },
    comision:{
        type: Number,
    },
    empresas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Empresas",
      },
    ],
    descuento:{
        type: Number,
        default: 0
    },
    flete:{
        type: Number,
        default: 0
    },
    facturas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facturas'
    }],
    facturado:{
        type: String,
        default:"No"
    },
},
    {
    timestamps: true,
    versionKey: false
});

surtidosSchema.plugin(AutoIncrement, {inc_field: 'idSurtido'});

// Índice para acelerar el filtro por rango de fechas (ListadoVentas / Surtidos)
surtidosSchema.index({ fecha: 1 });

const Surtidos = mongoose.model('Surtidos', surtidosSchema)
module.exports = Surtidos