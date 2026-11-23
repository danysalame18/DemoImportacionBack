const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosSurtidosSchema = new Schema({
    surtidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Surtidos'
        }],
    inventarios:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventarios'
        }],
    articulos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Articulos'
        }],
    clientes:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Clientes'
        }],
    areas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Areas'
    }],
    articulosPedido:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ArticulosPedido'
    }],
    cantidad:{
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
    facturas:
    [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facturas'
    }],
    facturado:{
        type: String,
        default:"No"
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosSurtidos = mongoose.model('ArticulosSurtidos', articulosSurtidosSchema)
module.exports = ArticulosSurtidos