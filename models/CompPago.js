const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const compPagoSchema = new Schema({
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
    cuentasClientes:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CuentasClientes'
    }],
    cuentasEmpresas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CuentasEmpresas'
    }],
},
    {
    timestamps: true,
    versionKey: false
});

compPagoSchema.plugin(AutoIncrement, {inc_field: 'idCompPago'});

const CompPago = mongoose.model('CompPago', compPagoSchema)
module.exports = CompPago