const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const devolucionesFiscalSchema = new Schema({
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

devolucionesFiscalSchema.plugin(AutoIncrement, {inc_field: 'idDevolucionFiscal'});

const DevolucionesFiscal = mongoose.model('DevolucionesFiscal', devolucionesFiscalSchema)
module.exports = DevolucionesFiscal