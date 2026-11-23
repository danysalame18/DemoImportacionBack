const mongoose = require ('mongoose')
const { Schema } = mongoose;

const comprasAcumuladosSchema = new Schema({
    fecha:{
        type: String,
        required: true,
    },
    cantidad:{
        type: Number,
        required: true,
    },
    embarques:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Embarques'
        }],
    compras:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Compras'
        }],
    articulosEmbarques:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ArticulosEmbarques'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    precio:{
        type: Number,
        required: true,
    },
    tipoCambio:{
        type: Number,
        required: true,
    },
    precioMX:{
        type: Number,
        required: true,
    },
    fecha:{
        type: String,
        required: true,
    },
},
    {
    timestamps: true,
    versionKey: false
});


const comprasAcumulados = mongoose.model('comprasAcumulados', comprasAcumuladosSchema)
module.exports = comprasAcumulados;