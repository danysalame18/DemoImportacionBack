const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosTSolV2Schema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    autorizadoApartado:{
        type: String,
    },
    autorizadoSurtido:{
        type: String,
    },
    traspasosSolicitudV2:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TraspasosSolicitudV2'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    cantidad:{
        type: Number,
        required: true
    },
    surtido:{
        type: Number,
        required: true
    },
    pendiente_surtir:{
        type: Number,
        required: true
    },
    precio:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosTSolV2 = mongoose.model('ArticulosTSolV2', articulosTSolV2Schema)
module.exports = ArticulosTSolV2