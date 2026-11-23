const mongoose = require ('mongoose')

const { Schema } = mongoose;

const pagosFacturaSchema = new Schema({
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
    compPago:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CompPago'
        }],
    PartialityNumber:{
        type: Number,
    },
    PreviousBalanceAmount:{
        type: Number,
    },
    AmountPaid:{
        type: Number,
    },
    ImpSaldoInsoluto:{
        type: Number,
    }
    
},
    {
    timestamps: true,
    versionKey: false
});


const PagosFacturas = mongoose.model('PagosFacturas', pagosFacturaSchema)
module.exports = PagosFacturas