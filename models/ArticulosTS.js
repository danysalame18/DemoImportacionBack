const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosTSSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    traspasosSalida:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TraspasosSalida'
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
    cantidad:{
        type: Number,
        required: true
    },
    inventarios:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventarios'
        }],
    surtido:{
        type: Number,
        default: 0
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

const ArticulosTS = mongoose.model('ArticulosTS', articulosTSSchema)
module.exports = ArticulosTS