const mongoose = require ('mongoose')

const { Schema } = mongoose;

const articulosPedidoSchema = new Schema({
    is_active:{
        type: String,
        default: "Si"
    },
    autorizadoApartado:{
        type: String,
        default: "Si"
    },
    autorizadoSurtido:{
        type: String,
        default: "Si"
    },
    pedidos:
        [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Pedidos'
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
    cantidad:{
        type: Number,
        required: true
    },
    cantidadProcesos:{
        type: Number,
        default: 0
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
    fecha:{
        type: String,
        required: true
    },
},
    {
    timestamps: true,
    versionKey: false
});

const ArticulosPedido = mongoose.model('ArticulosPedido', articulosPedidoSchema)
module.exports = ArticulosPedido