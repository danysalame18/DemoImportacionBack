const mongoose = require ('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const { Schema } = mongoose;

const embarquesSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    fechaEmbarque:{
        type: String,
        required: true
    },
    fechaEstimada:{
        type: String,
        required: true
    },
    contenedor:{
        type: String,
        required: true
    },
    observaciones:{
        type: String,
        required: true
    },
    total_cantidad:{
        type: Number,
        required: true
    },
    total_gasto:{
        type: Number,
        required: true
    },
    recibido:{
        type: String,
        default: "No"
    },
    total_costo:{
        type: Number,
        required: true
    },
    saldo:{
        type: Number,
        required: true
    },
    tipoCambioUSDMXN:{
        type: Number,
        required: true
    },
    tipoCambioCNYUSD:{
        type: Number,
        required: true
    },
    creado:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    bultos:{
        type: Number,
        required: true
    },
    noFactura:{
        type: String,
    },
    brokers:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brokers'
    }],
},
    {
    timestamps: true,
    versionKey: false
});

embarquesSchema.plugin(AutoIncrement, {inc_field: 'idEmbarques'});

const Embarques = mongoose.model('Embarques', embarquesSchema)
module.exports = Embarques