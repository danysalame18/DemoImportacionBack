const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const { Schema } = mongoose;

const facturasSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fecha:{
        type: String,
    },
    totalCantidad:{
        type: Number,
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
    timbre:{
        type: String,
    },
    respuestaFacturama:{
        type: Array,
    },
    respuestaFacturamaCancel:{
        type: Array,
    },
    idFacturama:{
        type: String,
    },
    serie:{
        type: String,
    },
    folio:{
        type: Number,
    },
    currency:{
        type: String,
    },
    expeditionPlace:{
        type: String,
    },
    condicionesPagoSATCliente:{
        type: String,
    },
    cfdiType:{
        type: String,
    },
    formaPagoSATCliente:{
        type: String,
    },
    metodoPagoSATCliente:{
        type: String, 
    },
    logoUrl:{
        type: String,     
    },
    observaciones:{
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
    rfcCliente:{
        type: String,
    },
    nombreCliente:{
        type: String,
    },
    usoCFDICliente:{
        type: String,
    },
    regFiscalCliente:{
        type: Number,
    },
    cpCliente:{
        type: String,
    },
    total:{
        type: Number,
    },
    iva:{
        type: Number,
    },
    subTotal:{
        type: Number,
    },
    descuentoPorcentaje1:{
        type: Number,
    },
    descuentoNumero1:{
        type: Number,
    },
    descuentoConcepto1:{
        type: String,
        default: "NA"
    },
    descuentoPorcentaje2:{
        type: Number,
    },
    descuentoNumero2:{
        type: Number,
    },
    descuentoConcepto2:{
        type: String,
        default: "NA"
    },
    folioFiscal:{
        type: String,
    },
    fechaCertificacion:{
        type: String,
    },
    selloDigital:{
        type: String,
    },
    numeroSerieCertificado:{
        type: String,
    },
    numeroSerieCertificadoSAT:{
        type: String,
    },
    cadenaSAT:{
        type: String,
    },
    selloDigitalSAT:{
        type: String,
    },
    rfcProvCertif:{
        type: String,
    },
    status:{
        type: String,
    },
    pagado:{
        type: String,
        default: "No"
    },
    abonos:{
        type: Number,
    },
    saldo:{
        type: Number,
    },
    numeroPagos:{
        type: Number,
        default: 0
    }
},
    {
    timestamps: true,
    versionKey: false
});

facturasSchema.plugin(AutoIncrement, {inc_field: 'idFactura'});

const Facturas = mongoose.model('Facturas', facturasSchema)
module.exports = Facturas