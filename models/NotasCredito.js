const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const notasCreditoSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
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
    empresas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Empresas'
        }],
    facturas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Facturas'
        }],
    facturasDetalle: [
  {
    factura: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facturas",
      required: true,
    },
    monto: {
      type: Number,
      default: 0,
    },
  },
],

    observaciones:{
        type: String,
    },
    timbre:{
        type: String,
    },
    cfdiType:{
        type: String,
    },
    serie:{
        type: String,
    },
    folio:{
        type: Number,
    },
    expeditionPlace:{
        type: String,
    },
    rfcEmpresa:{
        type: String,
    },
    nombreEmpresa:{
        type: String,
    },
    regFiscalEmpresa:{
        type: String,
    },
    cfdiUse:{
        type: String,
    },
    paymentForm:{
      type: String,
    },
    paymentMethod:{
      type: String,
    },
    subTotal:{
        type: Number,
    },
    iva:{
        type: Number,
    },
    total:{
        type: Number,
    },
    currency:{
        type: String,
    },
    idFacturama:{
        type: String,
    },
    respuestaFacturama:{
        type: Array,
    },
    respuestaFacturamaCancel:{
        type: Array,
    },
},
    {
    timestamps: true,
    versionKey: false
});

notasCreditoSchema.plugin(AutoIncrement, {inc_field: 'idNotaCredito'});

const NotasCredito = mongoose.model('NotasCredito', notasCreditoSchema)
module.exports = NotasCredito