const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosCotizacionesTiendasSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    cotizacionesTiendas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CotizacionesTiendas'
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

const ArticulosCotizacionesTiendas = mongoose.model('ArticulosCotizacionesTiendas', articulosCotizacionesTiendasSchema)
module.exports = ArticulosCotizacionesTiendas