const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosVentasTiendasSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    ventasTiendas:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VentasTiendas'
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
    precio:{
        type: Number,
        required: true
    },
    total:{
        type: Number,
        required: true
    },
    fecha:{
      type: String,
    },
    costoUnitario:{
        type: Number,
        default: 0
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosVentasTiendas = mongoose.model('ArticulosVentasTiendas', articulosVentasTiendasSchema)
module.exports = ArticulosVentasTiendas