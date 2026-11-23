const mongoose = require ('mongoose')
const { Schema } = mongoose;

const comprasAcumuladosHabSchema = new Schema({
    fecha:{
        type: String,
        required: true,
    },
    cantidad:{
        type: Number,
        required: true,
    },
    ordenesCompraHab:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrdenesCompraHab'
        }],
    comprasHab:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ComprasHab'
        }],
    proveedores:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Proveedores'
    }],
    habOC:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HabOC'
        }],
    insumos:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Insumos'
    }],
    total:{
        type: Number,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});


const comprasAcumuladosHab = mongoose.model('comprasAcumuladosHab', comprasAcumuladosHabSchema)
module.exports = comprasAcumuladosHab;