const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosTSolSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    traspasosSolicitud:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TraspasosSolicitud'
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
    autorizadoApartado:{
        type: String,
        default: "Si"
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosTSol = mongoose.model('ArticulosTSol', articulosTSolSchema)
module.exports = ArticulosTSol