const mongoose = require ('mongoose')

const { Schema } = mongoose;

const habOCSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    ordenesCompraHab:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrdenesCompraHab'
        }],
    insumos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Insumos'
    }],
    detalleSolicitudInsumosPedidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DetalleSolicitudInsumosPedidos'
        }],
    cantidad:{
        type: Number,
        required: true
    },
    recibido:{
        type: Number,
        required: true
    },
    pendiente_recibir:{
        type: Number,
        required: true
    },
    precio:{
        type: Number,
        required: true
    },
    descuento:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    }
},
    {
    timestamps: true,
    versionKey: false
});

const HabOC = mongoose.model('HabOC', habOCSchema)
module.exports = HabOC